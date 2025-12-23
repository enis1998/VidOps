package com.vidops.auth.service;

import java.util.UUID;

public interface JwtService {
    String issueAccessToken(UUID userId, String email, String rolesCsv);
}
