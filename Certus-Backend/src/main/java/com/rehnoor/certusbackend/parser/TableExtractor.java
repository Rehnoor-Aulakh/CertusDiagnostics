package com.rehnoor.certusbackend.parser;

import com.rehnoor.certusbackend.parser.model.ExtractedRow;
import com.rehnoor.certusbackend.parser.model.ExtractedTable;
import org.apache.pdfbox.pdmodel.PDDocument;
import technology.tabula.ObjectExtractor;
import technology.tabula.Page;
import technology.tabula.RectangularTextContainer;
import technology.tabula.Table;
import technology.tabula.extractors.BasicExtractionAlgorithm;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class TableExtractor {
    public List<ExtractedTable> extractTables(PDDocument document) throws IOException {
        List<ExtractedTable> tables = new ArrayList<>();

        ObjectExtractor extractor = new ObjectExtractor(document);
        BasicExtractionAlgorithm basic = new BasicExtractionAlgorithm();

        for (int page = 3; page <= document.getNumberOfPages() - 2; page++) {
            Page pdfPage = extractor.extract(page);
            List<Table> extracted = basic.extract(pdfPage);

            for (Table table : extracted) {
                ExtractedTable extractedTable = new ExtractedTable(page);
                for (List<RectangularTextContainer> row : table.getRows()) {
                    List<String> cells = new ArrayList<>();
                    for (RectangularTextContainer cell : row) {
                        cells.add(cell.getText().trim());
                    }
                    ExtractedRow extractedRow = new ExtractedRow(page, cells);
                    extractedTable.addRow(extractedRow);
                }
                tables.add(extractedTable);
            }
        }
        return tables;
    }



    // To be removed
//    public void printTables(List<ExtractedTable> tables) {
//
//        int tableNumber = 1;
//
//        for (ExtractedTable table : tables) {
//
//            System.out.println();
//            System.out.println("============================================================");
//            System.out.println("TABLE " + tableNumber++
//                    + " | PAGE " + table.getPageNumber());
//            System.out.println("============================================================");
//
//            int rowNumber = 1;
//
//            for (ExtractedRow row : table.getRows()) {
//
//                System.out.printf("%03d -> ", rowNumber++);
//
//                List<String> cells = row.getCells();
//
//                for (int i = 0; i < cells.size(); i++) {
//
//                    System.out.print("[" + i + "] ");
//
//                    if (cells.get(i).isBlank()) {
//                        System.out.print("<EMPTY>");
//                    } else {
//                        System.out.print(cells.get(i));
//                    }
//
//                    if (i != cells.size() - 1) {
//                        System.out.print("  |  ");
//                    }
//
//                }
//
//                System.out.println();
//
//            }
//        }
//    }
}
