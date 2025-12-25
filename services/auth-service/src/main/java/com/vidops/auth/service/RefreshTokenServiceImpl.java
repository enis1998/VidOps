package com.vidops.auth.service;

import com.vidops.auth.config.AuthProperties;
import com.vidops.auth.entity.RefreshToken;
import com.vidops.auth.exception.InvalidRefreshTokenException;
import com.vidops.auth.repository.RefreshTokenRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthProperties props;
    private final SecureRandom random = new SecureRandom();

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository, AuthProperties props) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.props = props;
    }

    @Override
    public long getAccessTtlSeconds() {
        return props.jwt().accessTtlSeconds();
    }

    @Override
    @Transactional
    public String issueAndSetCookie(UUID userId, HttpServletResponse res) {
        String raw = generateToken();
        String hash = sha256Hex(raw);

        Instant exp = Instant.now().plus(props.jwt().refreshTtlDays(), ChronoUnit.DAYS);
        refreshTokenRepository.save(RefreshToken.issue(userId, hash, exp));

        setRefreshCookie(raw, exp, res);
        return raw;
    }

    @Override
    @Transactional
    public UUID rotate(String refreshToken, HttpServletResponse res) {
        if (refreshToken == null || refreshToken.isBlank()) throw new InvalidRefreshTokenException();

        String oldHash = sha256Hex(refreshToken);
        RefreshToken old = refreshTokenRepository.findByTokenHash(oldHash)
                .orElseThrow(InvalidRefreshTokenException::new);

        Instant now = Instant.now();
        if (!old.isActive(now)) throw new InvalidRefreshTokenException();

        // issue new
        String newRaw = generateToken();
        String newHash = sha256Hex(newRaw);
        Instant newExp = now.plus(props.jwt().refreshTtlDays(), ChronoUnit.DAYS);

        refreshTokenRepository.save(RefreshToken.issue(old.getUserId(), newHash, newExp));

        // revoke old + link replacement
        old.revoke(newHash);
        refreshTokenRepository.save(old);

        setRefreshCookie(newRaw, newExp, res);
        return old.getUserId();
    }

    @Override
    @Transactional
    public void revoke(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;

        String hash = sha256Hex(refreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(t -> {
            if (t.getRevokedAt() == null) {
                t.revoke(null);
                refreshTokenRepository.save(t);
            }
        });
    }

    @Override
    public void clearCookie(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from(props.cookies().refreshCookieName(), "")
                .httpOnly(true)
                .secure(props.cookies().secure())
                .path(nullIfBlank(props.cookies().path(), "/"))
                .domain(nullIfBlank(props.cookies().domain()))
                .sameSite(nullIfBlank(props.cookies().sameSite(), "Lax"))
                .maxAge(0)
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Override
    @Transactional
    public long cleanupExpiredTokens() {
        return refreshTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }

    private void setRefreshCookie(String token, Instant expiresAt, HttpServletResponse res) {
        long maxAgeSeconds = Math.max(0, Instant.now().until(expiresAt, ChronoUnit.SECONDS));

        ResponseCookie cookie = ResponseCookie.from(props.cookies().refreshCookieName(), token)
                .httpOnly(true)
                .secure(props.cookies().secure())
                .path(nullIfBlank(props.cookies().path(), "/"))
                .domain(nullIfBlank(props.cookies().domain()))
                .sameSite(nullIfBlank(props.cookies().sameSite(), "Lax"))
                .maxAge(maxAgeSeconds)
                .build();

        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String generateToken() {
        byte[] bytes = new byte[32]; // 256-bit
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256Hex(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hashed.length * 2);
            for (byte b : hashed) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private static String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private static String nullIfBlank(String s, String defaultVal) {
        return (s == null || s.isBlank()) ? defaultVal : s;
    }
}
