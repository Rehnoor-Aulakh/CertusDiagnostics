package com.rehnoor.certusbackend.dto.history;

import com.rehnoor.certusbackend.enums.ReferenceRangeType;
import lombok.Data;

@Data
public class ReferenceRangeDTO {
    private ReferenceRangeType type;
    private Double min;
    private Double max;
    private String raw;
    // later we can remove the raw string


}
