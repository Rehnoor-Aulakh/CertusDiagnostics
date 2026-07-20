package com.rehnoor.certusbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ReactAuthResponse {
    private boolean success;
    private String message;
    private boolean is_new_user;
    private Object user;    // Maps to the tokenized User Object data context


}
