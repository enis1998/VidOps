package com.vidops.auth.web.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record GoogleLoginRequest(
        @JsonAlias({"idToken", "credential"})
        String idToken
) {}
