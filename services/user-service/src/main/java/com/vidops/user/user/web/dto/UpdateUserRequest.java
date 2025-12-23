package com.vidops.user.user.web.dto;

import com.vidops.user.user.enums.Plan;
import jakarta.validation.constraints.Min;

public record UpdateUserRequest(
        String fullName,
        Plan plan,
        @Min(0) Integer credits
) {}
