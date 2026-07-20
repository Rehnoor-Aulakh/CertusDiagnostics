package com.rehnoor.certusbackend.dto;

import com.google.common.annotations.GwtCompatible;
import com.rehnoor.certusbackend.model.Report;
import com.rehnoor.certusbackend.parser.model.TestResult;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Getter
@Setter
public class ReportResponse {
    private Long reportId;
    private Long patientId;
    private String testName;
    private BigDecimal price;
    private Report.ReportStatus reportStatus;
    private ZonedDateTime reportDate;
    private ZonedDateTime sampleCollectedOn;
    private ZonedDateTime sampleReceivedOn;
    private ZonedDateTime reportReleasedOn;

    public static class Summary {
        private int totalTests;
        private int abnormalTests;

        public Summary(int totalTests, int abnormalTests) {
            this.totalTests = totalTests;
            this.abnormalTests = abnormalTests;
        }

        public int getTotalTests() { return totalTests; }
        public void setTotalTests(int totalTests) { this.totalTests = totalTests; }
        public int getAbnormalTests() { return abnormalTests; }
        public void setAbnormalTests(int abnormalTests) { this.abnormalTests = abnormalTests; }
    }

    private Summary summary;

    private List<TestResult> abnormal;
    private List<TestResult> tests;
}
