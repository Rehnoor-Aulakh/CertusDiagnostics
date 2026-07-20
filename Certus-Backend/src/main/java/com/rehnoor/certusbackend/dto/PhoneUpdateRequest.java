package com.rehnoor.certusbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PhoneUpdateRequest {
    private Long user_id;
    private String phone_number;
    private String role;        // Expects ROLE_PATIENT or ROLE_ADMIN
}
