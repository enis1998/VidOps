package com.vidops.auth.service;

import com.vidops.auth.entity.AuthUser;

import java.util.UUID;

public interface AuthService {
    AuthUser register(String email, String rawPassword);
    AuthUser login(String email, String rawPassword);
    AuthUser googleLogin(String idToken);

    AuthUser getUser(UUID userId);

    String issueAccessToken(AuthUser user);
}
