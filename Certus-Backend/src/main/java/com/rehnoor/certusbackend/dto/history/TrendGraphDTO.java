package com.rehnoor.certusbackend.dto.history;

import com.rehnoor.certusbackend.enums.HealthTrendStatus;
import lombok.Data;

import java.util.List;

@Data
public class TrendGraphDTO {
    private String parameter;
    private String unit;
    private HealthTrendStatus status;
    private ReferenceRangeDTO referenceRangeDTO;
    private List<TimelinePointDTO> timeline;
    // can have the category here also

}
