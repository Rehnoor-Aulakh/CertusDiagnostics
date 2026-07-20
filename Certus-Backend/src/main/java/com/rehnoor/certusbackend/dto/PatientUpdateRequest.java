package com.rehnoor.certusbackend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Data
public class PatientUpdateRequest {
    private String name;
    private String email;
    private String phone;
    private LocalDate dob;
    private String gender;
}
