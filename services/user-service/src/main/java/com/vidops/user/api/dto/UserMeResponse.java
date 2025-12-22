package com.vidops.user.api.dto;

public record UserMeResponse(
    String id,
    String email,
    String fullName,
    String plan,
    int credits
) {}
