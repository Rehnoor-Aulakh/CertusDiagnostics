package com.rehnoor.certusbackend.parser;

import com.rehnoor.certusbackend.parser.model.ExtractedRow;
import com.rehnoor.certusbackend.parser.model.RowType;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Classifies extracted PDF rows into semantic types using a combination of:
 * - Exact prefix/pattern matching for obvious types (HEADER, FOOTER, COMMENT, REFERENCE)
 * - Score-based heuristics for ambiguous types (CATEGORY, METHOD details)
 * - Context-aware refinement (second pass) for remaining UNKNOWN lines
 */
public class RowClassifier {

    // Units recognised when deciding if a line looks like a test result
    private static final Set<String> COMMON_UNITS = Set.of(
            "MG/DL", "G/DL", "PG/ML", "NG/ML", "NG/DL", "U/L", "IU/L",
            "MIU/L", "%", "RATIO", "FL", "PQ", "PG", "GM/DL",
            "X 10^3", "X 10^6", "ΜG/ML", "ΜL", "ΜIU/ML",
            "MM/HR", "MM / HR", "MG/L",
            "ML/MIN", "X 103", "X 106",
            "ΜG/MG", "μG/ML", "μIU/ML", "μG/MG"
    );

    // Technology keywords that strongly signal a TEST_RESULT line
    private static final Set<String> TECHNOLOGY_KEYWORDS = Set.of(
            "PHOTOMETRY", "E.C.L.I.A", "C.M.I.A", "I.S.E", "CALCULATED",
            "IMMUNOTURBIDIMETRY", "H.P.L.C", "MODIFIED WESTERGREN",
            "FLOW CYTOMETRY", "HPLC"
    );

    private static final int CATEGORY_THRESHOLD = 8;
    private static final int METHOD_DETAIL_STANDALONE_THRESHOLD = 5;
    private static final int METHOD_DETAIL_CONTEXT_THRESHOLD = 3;

    // ---------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------

    /** Classify a single row without any surrounding context. */
    public RowType classify(ExtractedRow row) {
        return classifyText(row.getText());
    }

    /**
     * Classify every row with a context-aware second pass that resolves
     * remaining UNKNOWN lines by looking at their neighbours.
     */
    public List<RowType> classifyAll(List<ExtractedRow> rows) {
        List<RowType> types = new ArrayList<>(rows.size());
        for (ExtractedRow row : rows) {
            types.add(classifyText(row.getText()));
        }
        refineWithContext(rows, types);
        return types;
    }

    // ---------------------------------------------------------------
    // First-pass classifier (context-free)
    // ---------------------------------------------------------------

    private RowType classifyText(String text) {

        // --- Empty ---
        if (text.isBlank()) return RowType.EMPTY;

        // --- HEADER (prefix / content matches) ---
        if (text.startsWith("Processed At"))      return RowType.HEADER;
        if (text.startsWith("Patient Name"))       return RowType.HEADER;
        if (text.startsWith("Address"))            return RowType.HEADER;
        if (text.startsWith("Referred By"))        return RowType.HEADER;
        if (text.startsWith(":Referred By"))       return RowType.HEADER;
        if (text.startsWith("Sample Collected"))   return RowType.HEADER;
        if (text.startsWith("Sample Received"))    return RowType.HEADER;
        if (text.startsWith("Report Released"))    return RowType.HEADER;
        if (isAddress(text))                       return RowType.HEADER;
        if (isTableHeader(text))                   return RowType.HEADER;

        // --- FOOTER ---
        if (text.startsWith("Page :"))             return RowType.FOOTER;
        if (text.startsWith("Tests Done"))         return RowType.FOOTER;
        if (text.startsWith("Report Remarks"))     return RowType.FOOTER;
        if (text.contains("~~ End of report ~~")) return RowType.FOOTER;
        if (text.equals("MD(Path)") || text.equals("(Path)")) return RowType.FOOTER;
        if (text.startsWith("Scan QR"))            return RowType.FOOTER;
        if (isSignatureLine(text))                 return RowType.FOOTER;

        // --- METHOD (prefix) ---
        if (text.startsWith("Method"))             return RowType.METHOD;

        // --- COMMENT (prefix / keyword matches) ---
        if (text.startsWith("Clinical"))           return RowType.COMMENT;
        if (text.startsWith("Disclaimer"))         return RowType.COMMENT;
        if (text.startsWith("Please correlate"))   return RowType.COMMENT;
        if (text.startsWith("Specifications"))     return RowType.COMMENT;
        if (text.startsWith("Precision"))          return RowType.COMMENT;
        if (text.startsWith("Sensitivity"))        return RowType.COMMENT;
        if (text.startsWith("Kit Validation"))     return RowType.COMMENT;
        if (text.startsWith("- "))                 return RowType.COMMENT; // bullet
        if (text.startsWith("• "))                 return RowType.COMMENT; // unicode bullet
        if (text.startsWith("Note"))               return RowType.COMMENT;
        if (text.startsWith("*Note"))              return RowType.COMMENT;
        if (text.startsWith("Comments"))           return RowType.COMMENT;
        if (text.startsWith("Alert"))              return RowType.COMMENT;
        if (text.startsWith("Reference"))          return RowType.COMMENT; // "References :" / "Reference:"
        if (text.startsWith("Remarks"))            return RowType.COMMENT;
        if (text.startsWith("Tests Outside"))      return RowType.COMMENT;
        if (text.startsWith("Concentrations"))     return RowType.COMMENT;
        if (text.startsWith("Intra Assay"))        return RowType.COMMENT;
        if (text.startsWith("Inter Assay"))        return RowType.COMMENT;
        if (text.contains("(%CV)"))                return RowType.COMMENT;
        if (isCitation(text))                      return RowType.COMMENT;

        // --- REFERENCE (prefix + pattern) ---
        if (text.startsWith("Bio. Ref"))           return RowType.REFERENCE;
        if (text.startsWith("As per"))             return RowType.REFERENCE;
        if (text.startsWith("Children"))           return RowType.REFERENCE;
        if (text.startsWith("Acute phase"))        return RowType.REFERENCE;
        if (isReferenceLine(text))                 return RowType.REFERENCE;
        if (isReferenceDescription(text))          return RowType.REFERENCE;
        if (isStandaloneRange(text))               return RowType.REFERENCE;

        // --- Score-based CATEGORY ---
        if (categoryScore(text) >= CATEGORY_THRESHOLD) return RowType.CATEGORY;

        // --- TEST_RESULT ---
        if (looksLikeTestResult(text))             return RowType.TEST_RESULT;

        // --- Score-based METHOD detail (standalone, high bar) ---
        if (methodDetailScore(text) >= METHOD_DETAIL_STANDALONE_THRESHOLD)
            return RowType.METHOD;

        // --- Paragraph → COMMENT ---
        if (looksLikeParagraph(text))              return RowType.COMMENT;

        return RowType.UNKNOWN;
    }

    // ---------------------------------------------------------------
    // Context-aware refinement (second pass)
    // ---------------------------------------------------------------

    private void refineWithContext(List<ExtractedRow> rows, List<RowType> types) {
        for (int i = 0; i < types.size(); i++) {
            if (types.get(i) != RowType.UNKNOWN) continue;

            String text = rows.get(i).getText();
            RowType prev = i > 0 ? types.get(i - 1) : null;

            // After METHOD → likely METHOD detail (lower threshold)
            if (prev == RowType.METHOD
                    && methodDetailScore(text) >= METHOD_DETAIL_CONTEXT_THRESHOLD) {
                types.set(i, RowType.METHOD);
                continue;
            }

            // After REFERENCE → likely REFERENCE continuation
            if (prev == RowType.REFERENCE && looksLikeReferenceContent(text)) {
                types.set(i, RowType.REFERENCE);
                continue;
            }

            // After COMMENT → likely COMMENT continuation
            if (prev == RowType.COMMENT) {
                types.set(i, RowType.COMMENT);
                continue;
            }

            // Longish text that slipped through → COMMENT
            if (text.length() > 50) {
                types.set(i, RowType.COMMENT);
            }
        }
    }

    // ---------------------------------------------------------------
    // Score-based CATEGORY detection
    // ---------------------------------------------------------------

    /**
     * Categories are short, all-uppercase, no-digit section headers like
     * "CARDIAC RISK MARKERS", "DIABETES", "LIPID", "RENAL".
     * A score ≥ {@link #CATEGORY_THRESHOLD} classifies the line.
     */
    private int categoryScore(String text) {
        int score = 0;

        // All uppercase → strong signal
        if (text.equals(text.toUpperCase(Locale.ROOT))) {
            score += 3;
        } else {
            score -= 2;               // mixed-case penalty
        }

        // No digits → categories never contain numbers
        if (!text.matches(".*\\d.*"))  score += 3;

        // Word count 1-5
        int words = text.trim().split("\\s+").length;
        if (words >= 1 && words <= 5)  score += 2;

        // Short text
        if (text.length() < 60)        score += 1;

        // No colons / periods → categories are bare headings
        if (!text.contains(":"))       score += 1;
        if (!text.contains("."))       score += 1;
        else                           score -= 3; // strong penalty for dots

        // Parentheses, hyphens, asterisks → unlikely category
        if (text.contains("("))        score -= 2;
        if (text.contains("-"))        score -= 2;
        if (text.startsWith("*"))      score -= 3;
        if (text.contains("REFERENCE")) score -= 5;
        if (text.contains("VALUES"))   score -= 3;
        
        // Comma → unlikely category
        if (text.contains(","))        score -= 2;

        // Containing a unit string → probably a result or reference
        if (containsUnit(text))        score -= 2;

        // Containing a tech keyword → probably a result line
        if (containsTechnology(text))  score -= 5;

        // Boost for known category keywords
        for (String kw : new String[]{"LIPID", "LIVER", "RENAL", "THYROID", "DIABETES", "VITAMINS", "HEMOGRAM", "MARKERS", "PROFILE", "COUNT", "IRON", "ELEMENTS"}) {
            if (text.toUpperCase(Locale.ROOT).contains(kw)) {
                score += 4;
                break;
            }
        }

        return score;
    }

    // ---------------------------------------------------------------
    // Score-based METHOD-detail detection
    // ---------------------------------------------------------------

    /**
     * Method-detail lines look like:<br>
     * {@code CHOL - Cholesterol Oxidase, Esterase, Peroxidase}<br>
     * {@code BUN - Kinetic UV Assay.}<br>
     * {@code *FC- flowcytometry, *HF- hydrodynamic focussing}<br>
     */
    private int methodDetailScore(String text) {
        int score = 0;
        String upper = text.toUpperCase(Locale.ROOT);

        // Abbreviation → description pattern: "ABBREV - description"
        if (text.matches("^\\*?[A-Z][A-Z0-9/]{0,5}\\s*[-–]\\s+.+")) {
            score += 4;
        }

        // Chemistry / methodology keywords
        for (String kw : new String[]{
                "DERIVED FROM", "FULLY AUTOMATED", "ENZYMATIC", "COLORIMETRIC",
                "IMMUNOASSAY", "TURBIDIMETRY", "AGGLUTINATION", "IMPEDENCE",
                "FOCUSSING", "PEROXIDASE", "OXIDASE", "BIURET", "DIAZONIUM",
                "IFCC", "JAFFE", "ARSENAZO", "KINETIC UV", "FLOWCYTOMETRY",
                "ASSAY", "ELECTROCHEMILUMINESCENCE"
        }) {
            if (upper.contains(kw)) {
                score += 3;
                break;                     // one keyword hit is enough
            }
        }

        // Footnote markers: "(Reference : *FC-..." or lines beginning with "*"
        if (text.startsWith("*") || text.startsWith("(Reference")) {
            score += 2;
        }

        return score;
    }

    // ---------------------------------------------------------------
    // Helpers – deterministic checks
    // ---------------------------------------------------------------

    private boolean looksLikeParagraph(String text) {
        if (text.length() > 80 && text.contains(" ")) return true;
        return text.length() > 100;
    }

    private boolean looksLikeTestResult(String text) {
        if (!text.matches(".*\\d.*")) return false;
        if (containsUnit(text) || containsTechnology(text)) return true;
        if (text.contains("Ratio")) return true;
        return false;
    }

    private boolean isAddress(String text) {
        return text.contains("Plot No")
                || text.contains("Phase-IV")
                || text.contains("Gurgaon")
                || text.contains("Punjab")
                || text.contains("Haryana")
                || text.contains("Barcode")
                || text.contains("1st Floor")
                || text.contains("Referred By")
                || text.contains("MANAWALA")
                || text.contains("Sample Type")
                || text.matches("\\d{6}");
    }

    private boolean isReferenceDescription(String text) {
        String u = text.toUpperCase(Locale.ROOT);
        return u.startsWith("MALE")
                || u.startsWith("FEMALE")
                || u.startsWith("ADULT")
                || u.startsWith("NORMAL")
                || (u.startsWith("LOW") && text.length() < 40)
                || (u.startsWith("HIGH") && !u.contains("SENSITIVITY") && text.length() < 40)
                || u.startsWith("BORDERLINE")
                || u.startsWith("DESIRABLE")
                || u.startsWith("OPTIMAL")
                || u.startsWith("NEAR OPTIMAL")
                || u.startsWith("DEFICIENCY")
                || u.startsWith("INSUFFICIENCY")
                || u.startsWith("SUFFICIENCY")
                || u.startsWith("TOXICITY")
                || u.startsWith("GOOD CONTROL")
                || u.startsWith("FAIR CONTROL")
                || u.startsWith("UNSATISFACTORY")
                || u.startsWith("POOR CONTROL")
                || u.startsWith("VERY HIGH");
    }

    private boolean isReferenceLine(String text) {
        return text.startsWith("Below")
                || text.startsWith(">=")
                || text.startsWith("<=")
                || text.startsWith(">")
                || text.startsWith("<");
    }

    /** Standalone numeric range like "90 - 120 mg/dl: Good Control" or "5.7% - 6.4% : Prediabetic" */
    private boolean isStandaloneRange(String text) {
        return text.matches("^\\d+\\.?\\d*\\s*[-–]\\s*\\d+.*")
                || text.matches("^\\d+\\.?\\d*\\s*%\\s*[-–].*");
    }

    /** Loose check for reference-like continuation content (used in second pass). */
    private boolean looksLikeReferenceContent(String text) {
        if (isStandaloneRange(text))      return true;
        if (isReferenceLine(text))        return true;
        if (isReferenceDescription(text)) return true;
        String u = text.toUpperCase(Locale.ROOT);
        if (u.contains("MM/HR") || u.contains("MG/DL") || u.contains("NG/ML"))
            return true;
        return text.matches(".*\\d+\\s*[-–]\\s*\\d+.*") && text.length() < 60;
    }

    private boolean isSignatureLine(String text) {
        return text.matches("^Dr\\.?\\s+.+")
                || text.matches("^MD\\s*\\(.*");
    }

    private boolean isCitation(String text) {
        // "Levey AS, Stevens LA, ... 2009"
        if (text.matches("^[A-Z][a-z]+\\s+[A-Z],?.*\\d{4}.*")) return true;
        if (text.contains("et al"))         return true;
        if (text.contains("J Clin"))        return true;
        if (text.contains("Ann Intern"))    return true;
        if (text.contains("Ann clin"))      return true;
        if (text.contains("Textbook"))      return true;
        if (text.contains("Endocrinol"))    return true;
        // Numbered bibliography: "1.Clinical management..."
        if (text.matches("^\\d+\\..*\\d{4}.*")) return true;
        return false;
    }

    private boolean isTableHeader(String text) {
        String u = text.toUpperCase(Locale.ROOT);
        return u.contains("TEST NAME") && (u.contains("VALUE") || u.contains("UNITS"));
    }

    private boolean containsUnit(String text) {
        String u = text.toUpperCase(Locale.ROOT);
        return COMMON_UNITS.stream().anyMatch(u::contains);
    }

    private boolean containsTechnology(String text) {
        String u = text.toUpperCase(Locale.ROOT);
        return TECHNOLOGY_KEYWORDS.stream().anyMatch(u::contains);
    }
}
