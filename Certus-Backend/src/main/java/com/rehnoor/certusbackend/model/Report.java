package com.rehnoor.certusbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;

@Entity
@Table(name="reports")
@Getter
@Setter
@NoArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name= "patient_id", nullable = false)
    private Patient patientId;

    @Column(name = "test_name", nullable = false, length = 255)
    private String testName;

    @Column(nullable = false)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "report_location", length = 255)
    private String reportLocation;

    @Column(name = "sample_collected_on")
    private ZonedDateTime sampleCollectedOn;

    @Column(name = "sample_received_on")
    private ZonedDateTime sampleReceivedOn;

    @Column(name = "report_released_on")
    private ZonedDateTime reportReleasedOn;

    @Column(name = "report_date")
    private ZonedDateTime reportDate;

    public enum ReportStatus {
        PENDING, COMPLETED
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "report_status")
    private ReportStatus reportStatus;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @Column(name = "report_hash", length = 64)
    private String reportHash;

    @PrePersist
    protected void onPersist() {
        this.updatedAt = ZonedDateTime.now();
        generateReportHash();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
        generateReportHash();
    }

    public void generateReportHash() {
        try {
            StringBuilder sb = new StringBuilder();
            // Patient identity
            if (this.patientId != null) {
                sb.append(nullSafe(this.patientId.getName())).append("|");
                sb.append(nullSafe(this.patientId.getDob())).append("|");
            }
            // Test name (e.g. "Aarogyam Camp Profile 2, Iron Deficiency Profile + 1 Others")
            sb.append(nullSafe(this.testName)).append("|");
            // Best available 
            // date: reportDate -> sampleCollectedOn fallback
            ZonedDateTime effectiveDate = this.reportDate != null ? this.reportDate : this.sampleCollectedOn;
            sb.append(nullSafe(effectiveDate)).append("|");
            // Full test results JSON
            sb.append(nullSafe(this.testsData));

            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (int i = 0; i < encodedhash.length; i++) {
                String hex = Integer.toHexString(0xff & encodedhash[i]);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            this.reportHash = hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to generate report hash.", e);
        }
    }

    private static String nullSafe(Object value) {
        return value == null ? "" : value.toString();
    }


    //JSONB collections map to standard String containers here
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tests_included", nullable = false, columnDefinition = "jsonb")
    private String testsIncluded = "[]";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tests_data", columnDefinition = "jsonb")
    private String testsData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name= "abnormal_data", columnDefinition = "jsonb")
    private String abnormalData;

}
