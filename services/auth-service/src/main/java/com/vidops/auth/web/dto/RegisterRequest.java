package com.vidops.auth.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,

        @NotBlank
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        String password,

        String fullName
) {}
