package com.rehnoor.certusbackend.dto.history;

import lombok.Data;


@Data
public class TimelinePointDTO {
    private String date;
    private Double value;
    private boolean abnormal;
    @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
    private Double distanceFromNormal;

}
