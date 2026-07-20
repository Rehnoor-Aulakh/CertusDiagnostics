package com.rehnoor.certusbackend.parser.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TestResult {
    private String category;
    private String testName;
    private String technology;
    private String value;
    private String unit;
    private String referenceRange;
    private String method;
    private boolean abnormal;
}
