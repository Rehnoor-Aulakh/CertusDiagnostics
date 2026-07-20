package com.rehnoor.certusbackend.parser;

import com.rehnoor.certusbackend.parser.model.ExtractedRow;
import com.rehnoor.certusbackend.parser.model.TestResult;

import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses a single TEST_RESULT line (or its raw cells) into a structured
 * {@link TestResult} object with testName, technology, value, unit, and
 * optionally an inline reference range.
 *
 * <p>Typical line formats handled:
 * <ul>
 *   <li>{@code HEMOGLOBIN SLS-Hemoglobin Method 14.1 g/dL 13.0-17.0}</li>
 *   <li>{@code TOTAL CHOLESTEROL PHOTOMETRY 201 mg/dL < 200}</li>
 *   <li>{@code TSH RECEPTOR ANTIBODIES C.M.I.A 1.73 IU/L}</li>
 *   <li>{@code HbA1c H.P.L.C 10.5 %}</li>
 * </ul>
 */
public class TestResultLineParser {

    // Ordered longest-first so "SLS-HEMOGLOBIN METHOD" matches before "PHOTOMETRY" etc.
    private static final List<String> TECHNOLOGY_PATTERNS = List.of(
            "IMMUNOTURBIDIMETRY",
            "MODIFIED WESTERGREN",
            "SLS-HEMOGLOBIN METHOD",
            "SLS-Hemoglobin Method",
            "CPH DETECTION",
            "CPH Detection",
            "FLOW CYTOMETRY",
            "Flow Cytometry",
            "ELECTROCHEMILUMINESCENCE",
            "E.C.L.I.A",
            "C.M.I.A",
            "H.P.L.C",
            "I.S.E",
            "PHOTOMETRY",
            "Photometry",
            "CALCULATED",
            "Calculated",
            "HF & EI",
            "HF & FC"
    );

    // Known unit strings, ordered longest-first for greedy matching
    private static final List<String> KNOWN_UNITS = List.of(
            "X 10^6/μL", "X 10^3 / μL", "X 103 / μL", "X 106/μL",
            "mL/min/1.73 m2", "μg/mg of Creatinine",
            "mm / hr", "mm/hr",
            "X 10^6/µL", "X 10^3 / µL", "X 103 / µL",
            "mg/dL", "g/dL", "pg/mL", "ng/mL", "ng/dL",
            "μg/mL", "μg/dL", "μg/mg", "µg/mL",
            "mg/L", "gm/dL",
            "U/L", "IU/L", "mIU/L", "μIU/mL", "µIU/mL",
            "fL", "pq", "pg", "%", "Ratio"
    );

    private static final Pattern VALUE_PATTERN = Pattern.compile(
            "([<>]=?\\s*)?(-?\\d+(?:,\\d{3})*(?:\\.\\d+)?)"
    );

    // ---------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------

    /**
     * Parse a TEST_RESULT line into a structured {@link TestResult}.
     * Uses the raw cell list first (if multi-column); falls back to text.
     */
    public TestResult parse(ExtractedRow row) {
        List<String> nonEmpty = row.getCells().stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        // If Tabula split into ≥ 4 meaningful cells, try cell-based parsing
        if (nonEmpty.size() >= 4) {
            TestResult result = parseFromCells(nonEmpty);
            if (result != null && result.getValue() != null) return result;
        }

        return parseFromText(row.getText());
    }

    /** Convenience overload for a raw text string. */
    public TestResult parseText(String text) {
        return parseFromText(text);
    }

    // ---------------------------------------------------------------
    // Cell-based parsing
    // ---------------------------------------------------------------

    private TestResult parseFromCells(List<String> cells) {
        // Find the cell containing a standalone numeric value
        int valueIdx = -1;
        for (int i = 1; i < cells.size(); i++) {
            String c = cells.get(i);
            if (c.matches("[<>]=?\\s*-?\\d+(?:,\\d{3})*(?:\\.\\d+)?")) {
                valueIdx = i;
                break;
            }
        }
        if (valueIdx < 0) return null;

        TestResult result = new TestResult();
        result.setValue(cells.get(valueIdx));

        // Everything before valueIdx → testName + technology
        StringBuilder nameBuilder = new StringBuilder();
        String tech = "";
        for (int i = 0; i < valueIdx; i++) {
            String cell = cells.get(i);
            if (isTechnologyKeyword(cell)) {
                tech = cell;
            } else {
                if (nameBuilder.length() > 0) nameBuilder.append(" ");
                nameBuilder.append(cell);
            }
        }
        result.setTestName(cleanTestName(nameBuilder.toString()));
        result.setTechnology(tech);

        // Cells after valueIdx → unit, then reference
        if (valueIdx + 1 < cells.size()) {
            result.setUnit(cells.get(valueIdx + 1));
        }
        if (valueIdx + 2 < cells.size()) {
            result.setReferenceRange(cells.get(valueIdx + 2));
        }

        return result;
    }

    // ---------------------------------------------------------------
    // Text-based parsing
    // ---------------------------------------------------------------

    private TestResult parseFromText(String text) {
        TestResult result = new TestResult();

        // Step 1: split by technology keyword
        String testName = null;
        String tech      = null;
        String remainder = null;

        for (String pattern : TECHNOLOGY_PATTERNS) {
            int idx = indexOfIgnoreCase(text, pattern);
            if (idx >= 0) {
                testName  = text.substring(0, idx).trim();
                tech      = text.substring(idx, idx + pattern.length()).trim();
                remainder = text.substring(idx + pattern.length()).trim();
                break;
            }
        }

        if (testName != null) {
            result.setTestName(cleanTestName(testName));
            result.setTechnology(tech);
        } else {
            // No technology found → try splitting at first standalone number
            Matcher m = Pattern.compile("^(.+?)\\s+(\\d+(?:\\.\\d+)?.*)$").matcher(text);
            if (m.matches()) {
                result.setTestName(cleanTestName(m.group(1)));
                remainder = m.group(2).trim();
            } else {
                result.setTestName(cleanTestName(text));
                return result;
            }
        }

        // Step 2: extract value from remainder
        if (remainder == null || remainder.isBlank()) return result;

        Matcher valueMatcher = VALUE_PATTERN.matcher(remainder);
        if (!valueMatcher.find()) return result;

        String prefix = valueMatcher.group(1) != null ? valueMatcher.group(1).trim() : "";
        String number = valueMatcher.group(2);
        result.setValue(prefix.isEmpty() ? number : prefix + " " + number);

        String afterValue = remainder.substring(valueMatcher.end()).trim();
        if (afterValue.isEmpty()) return result;

        // Step 3: separate unit from inline reference range
        extractUnitAndRef(result, afterValue);

        return result;
    }

    // ---------------------------------------------------------------
    // Unit / reference separation
    // ---------------------------------------------------------------

    private void extractUnitAndRef(TestResult result, String text) {
        // Try known-unit lookup first (case-insensitive, longest match)
        for (String knownUnit : KNOWN_UNITS) {
            int idx = indexOfIgnoreCase(text, knownUnit);
            if (idx >= 0) {
                // Prepend any text before the unit (handles "X" before "103 / μL")
                String before = text.substring(0, idx).trim();
                String unitText = (before.isEmpty() ? "" : before + " ")
                        + text.substring(idx, idx + knownUnit.length()).trim();
                result.setUnit(unitText.trim());

                String after = text.substring(idx + knownUnit.length()).trim();
                if (!after.isEmpty()) {
                    result.setReferenceRange(after);
                }
                return;
            }
        }

        // Fallback: split by looking for a reference-range start
        // Reference patterns: "13.0-17.0", "< 200", "> 0.40", "9:1-23:1"
        Matcher refMatcher = Pattern.compile(
                "(.+?)\\s+(\\d+\\.?\\d*\\s*[-–]\\s*\\d+\\.?\\d*"  // range N-N
                        + "|[<>]=?\\s*\\d+\\.?\\d*"                    // < N or > N
                        + "|\\d+:\\d+\\s*-\\s*\\d+:\\d+"               // ratio range like 9:1-23:1
                        + "|Adult\\s*:.*)$"                            // "Adult : 17-43"
        ).matcher(text);

        if (refMatcher.matches()) {
            result.setUnit(refMatcher.group(1).trim());
            result.setReferenceRange(refMatcher.group(2).trim());
        } else {
            // No reference found → everything is the unit
            result.setUnit(text.trim());
        }
    }

    // ---------------------------------------------------------------
    // Utility
    // ---------------------------------------------------------------

    private boolean isTechnologyKeyword(String cell) {
        String upper = cell.toUpperCase(Locale.ROOT);
        for (String pattern : TECHNOLOGY_PATTERNS) {
            if (upper.equals(pattern.toUpperCase(Locale.ROOT))) return true;
        }
        return false;
    }

    private int indexOfIgnoreCase(String text, String pattern) {
        return text.toUpperCase(Locale.ROOT)
                .indexOf(pattern.toUpperCase(Locale.ROOT));
    }

    private String cleanTestName(String name) {
        if (name == null) return null;
        String cleaned = name.trim();
        if (cleaned.endsWith("(")) {
            cleaned = cleaned.substring(0, cleaned.length() - 1).trim();
        }
        return cleaned;
    }
}
