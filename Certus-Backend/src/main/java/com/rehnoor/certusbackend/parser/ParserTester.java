package com.rehnoor.certusbackend.parser;

import com.rehnoor.certusbackend.parser.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class ParserTester {

    public static void main(String[] args) throws IOException {

        File pdf = new File(
                "/Users/rehnooraulakh/Documents/Certus-Diagnostics-main/Certus-Backend/src/main/resources/reports/PREM KUMAR_FJ801363.pdf");

        try (PDDocument document = Loader.loadPDF(pdf)) {

            TableExtractor extractor = new TableExtractor();
            RowClassifier classifier = new RowClassifier();
            MetadataExtractor metadataExtractor = new MetadataExtractor();
            ReportAssembler assembler = new ReportAssembler();

            // ── Part 0: Metadata Extraction (must run before Tabula) ──
            DiagnosticMetadata metadata = metadataExtractor.extract(document);

            List<ExtractedTable> tables = extractor.extractTables(document);

            // ── Part 1: Classification output (for debugging) ──────
            int totalRows = 0;
            int unknownRows = 0;

            for (ExtractedTable table : tables) {
                System.out.println();
                System.out.println("PAGE " + table.getPageNumber());

                List<RowType> types = classifier.classifyAll(table.getRows());

                for (int i = 0; i < table.getRows().size(); i++) {
                    RowType type = types.get(i);
                    String text = table.getRows().get(i).getText();
                    System.out.printf("%-12s -> %s%n", type, text);
                    totalRows++;
                    if (type == RowType.UNKNOWN) unknownRows++;
                }
            }

            System.out.println();
            System.out.println("=".repeat(60));
            System.out.printf("Classification: %d/%d rows classified (%.1f%% UNKNOWN)%n",
                    totalRows - unknownRows, totalRows,
                    totalRows > 0 ? (unknownRows * 100.0 / totalRows) : 0);
            System.out.println("=".repeat(60));

            // ── Part 2: Structured JSON output ─────────────────────
            DiagnosticReport report = assembler.assemble(metadata, tables, classifier);

            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);

            System.out.println();
            System.out.println("=".repeat(60));
            System.out.println("METADATA");
            System.out.println("=".repeat(60));
            System.out.println(metadata);

            System.out.println();
            System.out.println("=".repeat(60));
            System.out.printf("TESTS INCLUDED (%d)%n", report.getTestsIncluded().size());
            System.out.println("=".repeat(60));
            for (String name : report.getTestsIncluded()) {
                System.out.println("  • " + name);
            }

            System.out.println();
            System.out.println("=".repeat(60));
            System.out.printf("ABNORMAL TESTS (%d)%n", report.getAbnormalTests().size());
            System.out.println("=".repeat(60));
            for (TestResult t : report.getAbnormalTests()) {
                System.out.printf("  ⚠ %-40s  %s %s  (ref: %s)%n",
                        t.getTestName(), t.getValue(), t.getUnit(), t.getReferenceRange());
            }

            System.out.println();
            System.out.println("=".repeat(60));
            System.out.println("FULL JSON OUTPUT");
            System.out.println("=".repeat(60));

            // Build a clean JSON with just the test data
            var jsonOutput = new java.util.LinkedHashMap<String, Object>();
            jsonOutput.put("testsIncluded", report.getTestsIncluded());
            jsonOutput.put("testsData", report.getTests());
            jsonOutput.put("abnormalData", report.getAbnormalTests());

            System.out.println(mapper.writeValueAsString(jsonOutput));
        }
    }
}