package com.vidops.auth.service;

import com.vidops.auth.entity.AuthUser;

import java.util.UUID;

public interface AuthService {
    AuthUser register(String fullName, String email, String rawPassword);

    void requestEmailVerification(String email);

    void verifyEmail(String token);

    AuthUser login(String email, String rawPassword);

    AuthUser googleLogin(String idToken);

    AuthUser getUser(UUID userId);

    String issueAccessToken(AuthUser user);

    void deleteAccount(UUID userId);

    void changePassword(UUID userId, String currentPassword, String newPassword);
}
