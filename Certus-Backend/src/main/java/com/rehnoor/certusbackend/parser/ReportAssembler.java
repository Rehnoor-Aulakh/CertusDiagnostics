package com.rehnoor.certusbackend.parser;

import com.rehnoor.certusbackend.parser.model.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Walks through classified rows produced by {@link RowClassifier} and assembles
 * them into a structured {@link DiagnosticReport} with properly grouped
 * test results, reference ranges, methods, and abnormal flags.
 *
 * <p>The assembler recognises two report layouts:
 * <ul>
 *   <li><b>Compact</b> – a single table page with inline reference ranges
 *       (e.g. "TOTAL CHOLESTEROL PHOTOMETRY 201 mg/dL &lt; 200")</li>
 *   <li><b>Spread</b> – one test per section with separate REFERENCE /
 *       METHOD rows following the TEST_RESULT line</li>
 * </ul>
 */
public class ReportAssembler {

    private final TestResultLineParser lineParser = new TestResultLineParser();

    // ---------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------

    /**
     * Assemble a full report from extracted tables.
     *
     * @param metadata   pre-extracted patient/report metadata
     * @param tables     pages of extracted rows (from Tabula)
     * @param classifier the classifier to use (with context-aware second pass)
     * @return a fully populated {@link DiagnosticReport}
     */
    public DiagnosticReport assemble(
            DiagnosticMetadata metadata,
            List<ExtractedTable> tables,
            RowClassifier classifier) {

        DiagnosticReport report = new DiagnosticReport();
        report.setMetadata(metadata);

        List<TestResult> allTests = new ArrayList<>();

        String currentCategory = "General";
        TestResult currentTest = null;
        StringBuilder refCollector = new StringBuilder();
        StringBuilder methodCollector = new StringBuilder();

        for (ExtractedTable table : tables) {
            currentCategory = "General"; // Reset per section/page
            List<ExtractedRow> rows = table.getRows();
            List<RowType> types = classifier.classifyAll(rows);

            for (int i = 0; i < rows.size(); i++) {
                RowType type = types.get(i);
                String text = rows.get(i).getText();

                switch (type) {

                    case CATEGORY:
                        currentCategory = text.trim();
                        break;

                    case TEST_RESULT:
                        // ── finalise the previous test ──────────────
                        finaliseTest(currentTest, refCollector, methodCollector);

                        // ── parse the new test line ─────────────────
                        currentTest = lineParser.parse(rows.get(i));
                        currentTest.setCategory(inferCategory(currentTest.getTestName(), currentCategory));
                        allTests.add(currentTest);

                        refCollector = new StringBuilder();
                        methodCollector = new StringBuilder();
                        break;

                    case REFERENCE:
                        // Strip the "Bio. Ref. Interval. :-" boilerplate
                        String refText = text
                                .replaceFirst("(?i)^Bio\\.?\\s*Ref\\.?\\s*Interval\\.?\\s*:?-?\\s*", "")
                                .trim();
                        if (!refText.isEmpty()) {
                            if (refCollector.length() > 0) refCollector.append(" | ");
                            refCollector.append(refText);
                        }
                        break;

                    case METHOD:
                        String methodText = text
                                .replaceFirst("(?i)^Method\\s*:?-?\\s*", "")
                                .trim();
                        if (!methodText.isEmpty()) {
                            if (methodCollector.length() > 0) methodCollector.append("; ");
                            methodCollector.append(methodText);
                        }
                        break;

                    default:
                        // HEADER, FOOTER, COMMENT, EMPTY, UNKNOWN → skip
                        break;
                }
            }
        }

        // finalise the very last test
        finaliseTest(currentTest, refCollector, methodCollector);

        // ── filter and deduplicate ─────────────────────────────────
        List<TestResult> filteredTests = new ArrayList<>();
        java.util.Set<String> seenTests = new java.util.HashSet<>();

        for (TestResult t : allTests) {
            String name = t.getTestName();
            if (name == null || name.trim().isEmpty()) continue;

            // 1. Filter tests missing value or reference range
            String val = t.getValue();
            if (val == null || val.trim().isEmpty()) continue;

            String ref = t.getReferenceRange();
            if (ref == null || ref.trim().isEmpty()) continue;

            // 2. Filter out explanatory text (more than 15 words)
            if (name.split("\\s+").length > 15) continue;

            // 3. Deduplicate by test name and clean up reference range
            String cleanedRef = ref.replaceAll("(?i)^of\\s+", "").replaceAll("(<|>|<=|>=)\\s+(\\d)", "$1$2");
            t.setReferenceRange(cleanedRef);

            String key = name.replaceAll("\\(.*?\\)", "").replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
            if (seenTests.add(key)) {
                filteredTests.add(t);
            }
        }
        allTests = filteredTests;
        
        report.setTests(allTests);

        List<String> testNames = new ArrayList<>();
        List<TestResult> abnormal = new ArrayList<>();

        for (TestResult t : allTests) {
            if (t.getTestName() != null && !t.getTestName().isBlank()) {
                testNames.add(t.getTestName());
            }
            if (t.isAbnormal()) {
                abnormal.add(t);
            }
        }

        report.setTestsIncluded(testNames); // Kept in entity to avoid DB schema change, but won't be sent in DTO
        report.setAbnormalTests(abnormal);

        return report;
    }

    // ---------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------

    private void finaliseTest(
            TestResult test,
            StringBuilder refCollector,
            StringBuilder methodCollector) {

        if (test == null) return;

        // Attach collected reference lines
        if (refCollector.length() > 0) {
            String collected = refCollector.toString();
            if (test.getReferenceRange() == null || test.getReferenceRange().isBlank()) {
                test.setReferenceRange(collected);
            } else {
                // Append additional reference information
                test.setReferenceRange(test.getReferenceRange() + " | " + collected);
            }
        }

        // Attach method
        if (methodCollector.length() > 0) {
            test.setMethod(methodCollector.toString());
        }

        // Compute abnormal flag
        if (test.getValue() != null && test.getReferenceRange() != null) {
            test.setAbnormal(isAbnormal(test.getValue(), test.getReferenceRange()));
        }
    }

    /**
     * Determines whether the observed value falls outside the reference range.
     * Handles formats: "low-high", "&lt; max", "&gt; min", "&lt;= max", "&gt;= min".
     */
    private boolean isAbnormal(String rawValue, String reference) {
        if (rawValue == null || reference == null) return false;

        try {
            double val = Double.parseDouble(
                    rawValue.replaceAll("[<>=~\\s]", "").replace(",", ""));

            String ref = reference.toUpperCase(Locale.ROOT);
            ref = ref.replace("BELOW", "<").replace("LESS THAN", "<");
            ref = ref.replace("ABOVE", ">").replace("MORE THAN", ">");
            ref = ref.replace("UPTO", "<=").replace("UP TO", "<=");
            
            // Try to isolate the normal section
            String normalSection = ref;
            String[] keywords = {"NORMAL", "GOOD CONTROL", "DESIRABLE", "OPTIMAL", "AVERAGE RISK", "LOW RISK"};
            for (String segment : ref.split("\\|")) {
                boolean found = false;
                for (String kw : keywords) {
                    if (segment.contains(kw)) {
                        normalSection = segment;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }

            // Try to find both range and bounds to see which comes first in the string
            Matcher range = Pattern.compile("(\\d+\\.?\\d*)\\s*[-–]\\s*(\\d+\\.?\\d*)").matcher(normalSection);
            Matcher bound = Pattern.compile("(>=|>|<=|<)\\s*(\\d+\\.?\\d*)").matcher(normalSection);
            
            int rangeIdx = range.find() ? range.start() : Integer.MAX_VALUE;
            int boundIdx = bound.find() ? bound.start() : Integer.MAX_VALUE;
            
            if (rangeIdx < boundIdx && rangeIdx != Integer.MAX_VALUE) {
                double lo = Double.parseDouble(range.group(1));
                double hi = Double.parseDouble(range.group(2));
                return val < lo || val > hi;
            } else if (boundIdx != Integer.MAX_VALUE) {
                String op = bound.group(1);
                double limit = Double.parseDouble(bound.group(2));
                if (op.equals(">=")) return val < limit;
                if (op.equals(">")) return val <= limit;
                if (op.equals("<=")) return val > limit;
                if (op.equals("<")) return val >= limit;
            }

        } catch (NumberFormatException ignored) {
            // unparseable value → not marked abnormal
        }
        return false;
    }

    /**
     * Fallback inference for categories if the table boundaries confused the parser.
     */
    private String inferCategory(String testName, String currentCategory) {
        if (testName == null || testName.isBlank()) return currentCategory;
        String upper = testName.toUpperCase(Locale.ROOT);
        
        if (upper.contains("CHOLESTEROL") || upper.contains("HDL") || upper.contains("LDL") || upper.contains("TRIGLYCERIDE") || upper.contains("VLDL") || upper.contains("APO ")) {
            return "LIPID";
        }
        if (upper.equals("T3") || upper.equals("T4") || upper.contains("TSH") || upper.contains("THYROXINE") || upper.contains("TRIIODOTHYRONINE")) {
            return "THYROID";
        }
        if (upper.contains("BILIRUBIN") || upper.contains("SGOT") || upper.contains("SGPT") || upper.contains("AST") || upper.contains("ALT") || upper.contains("ALKALINE PHOSPHATASE") || upper.contains("PROTEIN") || upper.contains("ALBUMIN") || upper.contains("GLOBULIN")) {
            return "LIVER";
        }
        if (upper.contains("UREA") || upper.contains("CREATININE") || upper.contains("URIC ACID") || upper.contains("BUN") || upper.contains("CALCIUM")) {
            return "RENAL";
        }
        if (upper.contains("HBA1C") || upper.contains("GLUCOSE") || upper.contains("INSULIN") || upper.contains("ABG") || upper.contains("AVERAGE BLOOD GLUCOSE")) {
            return "DIABETES";
        }
        if (upper.contains("VITAMIN B") || upper.contains("B-12") || upper.contains("B12") || upper.contains("VITAMIN D") || upper.contains("25-OH")) {
            return "VITAMINS";
        }
        if (upper.contains("LEUCOCYTE") || upper.contains("NEUTROPHIL") || upper.contains("LYMPHOCYTE") || upper.contains("MONOCYTE") || upper.contains("EOSINOPHIL") || upper.contains("BASOPHIL") || upper.contains("HEMOGLOBIN") || upper.contains("RBC") || upper.contains("PCV") || upper.contains("MCV") || upper.contains("MCH") || upper.contains("RDW") || upper.contains("PLATELET") || upper.contains("MPV") || upper.contains("PDW") || upper.contains("PCT")) {
            return "COMPLETE HEMOGRAM";
        }
        if (upper.contains("IRON") || upper.contains("TIBC") || upper.contains("FERRITIN") || upper.contains("TRANSFERRIN")) {
            return "IRON DEFICIENCY";
        }
        if (upper.contains("TESTOSTERONE") || upper.contains("PROLACTIN")) {
            return "HORMONE";
        }
        return currentCategory;
    }
}
