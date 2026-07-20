package com.rehnoor.certusbackend.parser.model;

import java.util.ArrayList;
import java.util.List;

public class ExtractedRow {
    private int pageNumber;

    private List<String> cells;
    public ExtractedRow(){

    }
    public ExtractedRow(int pageNumber, List<String> cells){
        this.pageNumber = pageNumber;
        this.cells = cells;
    }
    public int getPageNumber(){
        return pageNumber;
    }
    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }
    public void addCell(String cell){
        cells.add(cell);
    }

    public List<String> getCells() {
        return cells;
    }
    public void setCells(List<String> cells){
        this.cells = cells;
    }
    public String getText() {
        return String.join(" ", cells)
                .replaceAll("\\s+", " ")
                .trim();
    }
}
