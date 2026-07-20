package com.rehnoor.certusbackend.parser.model;

import java.util.ArrayList;
import java.util.List;

public class ExtractedTable {
    private final int pageNumber;
    private final List<ExtractedRow> rows = new ArrayList<>();

    public ExtractedTable(int pageNumber){
        this.pageNumber= pageNumber;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public List<ExtractedRow> getRows() {
        return rows;
    }

    public void addRow(ExtractedRow row) {
        rows.add(row);
    }
}
