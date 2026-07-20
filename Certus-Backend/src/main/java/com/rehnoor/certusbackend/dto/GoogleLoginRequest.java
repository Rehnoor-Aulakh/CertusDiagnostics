package com.rehnoor.certusbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleLoginRequest {
    private String action;
    private String role;
    private String credential;  // The raw Google JWT ID Token String
    private GoogleUserData user_data;

    @Getter
    @Setter
    public static class GoogleUserData{
        private String email;
        private String name;
        private String picture;
        private String google_id;
        private boolean email_verified;
        private String phone;
    }

}
