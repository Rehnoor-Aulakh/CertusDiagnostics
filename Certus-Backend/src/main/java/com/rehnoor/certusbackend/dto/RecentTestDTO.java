package com.rehnoor.certusbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class RecentTestDTO {
    private Long report_id;
    private String test_name;
    private String patient_name;
    private LocalDateTime test_date_time;
    private String status;
    private Long hours_ago;

}
