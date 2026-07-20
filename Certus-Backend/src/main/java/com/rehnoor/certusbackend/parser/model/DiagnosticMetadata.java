package com.rehnoor.certusbackend.parser.model;

import com.rehnoor.certusbackend.model.Patient;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class DiagnosticMetadata {
    private String patientName;
    private Integer age;
    private Gender gender;
    private LocalDateTime reportDate;
    private LocalDateTime sampleCollectedOn;
    private LocalDateTime sampleReceivedOn;
    private LocalDateTime reportReleasedOn;
    private String packageName;
    private String reportStatus;
    private BigDecimal amountCollected;

    @Override
    public String toString() {
        return "DiagnosticMetadata{" +
                "patientName='" + patientName + '\'' +
                ", age=" + age +
                ", gender='" + gender + '\'' +
                ", reportDate=" + reportDate +
                ", packageName='" + packageName + '\'' +
                ", reportStatus='" + reportStatus + '\'' +
                ", amountCollected=" + amountCollected +
                '}';
    }
}
