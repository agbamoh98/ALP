package com.alp.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {

    private UserDto user;
    private TokenDto tokens;

    @Data
    @Builder
    public static class TokenDto {
        private String accessToken;
        private String tokenType;
        private long expiresIn;
    }
}
