package com.vidops.user.user.web.dto;

import com.vidops.user.user.enums.Plan;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        Plan plan,
        Integer credits,
        Instant createdAt,
        Instant updatedAt
) {}
