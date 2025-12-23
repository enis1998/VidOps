package com.vidops.user.user.web.dto;

import com.vidops.user.user.enums.Plan;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequest(
        @Email @NotBlank String email,
        @NotBlank String fullName,
        @NotNull Plan plan,
        @NotNull @Min(0) Integer credits
) {}
