package com.rehnoor.certusbackend.parser.model;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DiagnosticReport {
    private DiagnosticMetadata metadata;
    private List<TestResult> tests = new ArrayList<>();
    private List<TestResult> abnormalTests = new ArrayList<>();
    private List<String> testsIncluded = new ArrayList<>();
}
