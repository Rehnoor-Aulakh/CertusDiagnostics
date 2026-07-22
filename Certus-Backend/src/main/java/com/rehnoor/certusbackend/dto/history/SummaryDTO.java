package com.rehnoor.certusbackend.dto.history;

import lombok.Data;

@Data
public class SummaryDTO {
    private int totalTests;
    private int recovered;
    private int improving;
    private int worsening;
    private int needsAttention;
    private int stableNormal;
    private int abnormal;
    private int healthScore;
    private String heading;
    @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
    private String subHeading;

}
