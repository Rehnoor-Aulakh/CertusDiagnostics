package com.rehnoor.certusbackend.dto.history;

import com.rehnoor.certusbackend.enums.HealthTrendStatus;
import com.rehnoor.certusbackend.service.HealthHistoryService.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Data
@Getter
@Setter
public class TestHistoryDTO {
    private String testName;
    private String category;
    private String unit;
    private String referenceRange;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ReferenceRange parsedRange;
    private HealthTrendStatus status;
    private List<TimelinePointDTO> timeline = new ArrayList<>();
}