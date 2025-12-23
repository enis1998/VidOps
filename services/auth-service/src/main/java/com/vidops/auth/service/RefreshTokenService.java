package com.vidops.auth.service;

import jakarta.servlet.http.HttpServletResponse;

import java.util.UUID;

public interface RefreshTokenService {
    // login/register sonrası
    String issueAndSetCookie(UUID userId, HttpServletResponse res);

    // refresh endpoint için: verify + revoke old + issue new + cookie set
    UUID rotate(String refreshToken, HttpServletResponse res);

    // logout veya refresh’te eskiyi iptal etmek için
    void revoke(String refreshToken);

    // logout
    void clearCookie(HttpServletResponse res);

    long getAccessTtlSeconds();
}
