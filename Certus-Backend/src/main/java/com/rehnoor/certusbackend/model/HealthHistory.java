package com.rehnoor.certusbackend.model;

import com.rehnoor.certusbackend.dto.history.SummaryDTO;
import com.rehnoor.certusbackend.dto.history.TestHistoryDTO;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name="health_history")
public class HealthHistory {
    @Id
    private Long patientId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name="patient_id")
    private Patient patient;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private SummaryDTO summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private List<TestHistoryDTO> graphs;

    @Column(name="last_report_id")
    private Long lastReportId;

    @Column(name="report_count", nullable = false)
    private Integer reportCount = 0;

    @Column(name="created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
