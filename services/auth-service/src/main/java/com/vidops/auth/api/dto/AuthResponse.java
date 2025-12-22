package com.vidops.auth.api.dto;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresInSeconds,
    String userId,
    String email
) {}
