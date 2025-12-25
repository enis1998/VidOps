package com.vidops.auth.web.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,      // "Bearer"
        long expiresInSeconds, // örn: 900
        String userId,
        String email
) {}
