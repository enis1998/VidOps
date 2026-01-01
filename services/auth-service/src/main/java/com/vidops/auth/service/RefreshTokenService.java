package com.vidops.auth.service;

import jakarta.servlet.http.HttpServletResponse;

import java.util.UUID;

public interface RefreshTokenService {
    long getAccessTtlSeconds();

    String issueAndSetCookie(UUID userId, HttpServletResponse res);

    /**
     * Validates old refresh token, revokes it, issues a new refresh token and sets cookie.
     * Returns the userId.
     */
    UUID rotate(String refreshToken, HttpServletResponse res);

    void revoke(String refreshToken);

    void clearCookie(HttpServletResponse res);

    long cleanupExpiredTokens();

    // YENİ: kullanıcıya ait tüm refresh tokenları sil
    long revokeAll(UUID userId);
}
