package com.vidops.auth.service;

import com.vidops.auth.api.dto.AuthResponse;
import com.vidops.auth.api.dto.LoginRequest;
import com.vidops.auth.api.dto.RegisterRequest;
import com.vidops.auth.api.error.AuthException;
import com.vidops.auth.config.VidopsSecurityProperties;
import com.vidops.auth.domain.AuthUser;
import com.vidops.auth.domain.RefreshToken;
import com.vidops.auth.events.EventTopics;
import com.vidops.auth.events.UserRegisteredEvent;
import com.vidops.auth.repo.AuthUserRepository;
import com.vidops.auth.repo.RefreshTokenRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthApplicationService {

  private final AuthUserRepository users;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final RefreshCookieService cookieService;
  private final VidopsSecurityProperties props;
  private final KafkaTemplate<String, Object> kafka;

  public AuthApplicationService(
      AuthUserRepository users,
      RefreshTokenRepository refreshTokens,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      RefreshCookieService cookieService,
      VidopsSecurityProperties props,
      KafkaTemplate<String, Object> kafka
  ) {
    this.users = users;
    this.refreshTokens = refreshTokens;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.cookieService = cookieService;
    this.props = props;
    this.kafka = kafka;
  }

  @Transactional
  public AuthResponse register(RegisterRequest req, HttpHeaders responseHeaders) {
    String email = normalizeEmail(req.email());
    if (users.existsByEmail(email)) {
      throw AuthException.emailTaken();
    }

    UUID userId = UUID.randomUUID();
    String passwordHash = passwordEncoder.encode(req.password());
    AuthUser user = new AuthUser(userId, email, passwordHash, "USER");
    users.save(user);

    // Refresh token (stored hashed in DB, raw in HttpOnly cookie)
    String rawRefresh = CryptoUtil.randomUrlSafeToken(48);
    String refreshHash = CryptoUtil.sha256Hex(rawRefresh);
    Instant exp = Instant.now().plus(Duration.ofDays(props.jwt().refreshTtlDays()));
    RefreshToken rt = new RefreshToken(UUID.randomUUID(), userId, refreshHash, exp);
    refreshTokens.save(rt);

    cookieService.setRefreshCookie(responseHeaders, rawRefresh, Duration.ofDays(props.jwt().refreshTtlDays()));

    // Access token
    var access = jwtService.issueAccessToken(userId, email, user.getRoles());

    // Publish event (simple MVP; production: outbox pattern)
    kafka.send(EventTopics.USER_REGISTERED_V1, userId.toString(), UserRegisteredEvent.v1(userId.toString(), email, req.fullName()));

    return new AuthResponse(access.token(), "Bearer", access.expiresInSeconds(), userId.toString(), email);
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest req, HttpHeaders responseHeaders) {
    String email = normalizeEmail(req.email());
    AuthUser user = users.findByEmail(email).orElseThrow(AuthException::badCredentials);
    if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
      throw AuthException.badCredentials();
    }

    // create new refresh token (rotate on login as well)
    String rawRefresh = CryptoUtil.randomUrlSafeToken(48);
    String refreshHash = CryptoUtil.sha256Hex(rawRefresh);
    Instant exp = Instant.now().plus(Duration.ofDays(props.jwt().refreshTtlDays()));
    refreshTokens.save(new RefreshToken(UUID.randomUUID(), user.getId(), refreshHash, exp));
    cookieService.setRefreshCookie(responseHeaders, rawRefresh, Duration.ofDays(props.jwt().refreshTtlDays()));

    var access = jwtService.issueAccessToken(user.getId(), user.getEmail(), user.getRoles());
    return new AuthResponse(access.token(), "Bearer", access.expiresInSeconds(), user.getId().toString(), user.getEmail());
  }

  @Transactional
  public AuthResponse refresh(Optional<String> refreshCookie, HttpHeaders responseHeaders) {
    String raw = refreshCookie.orElseThrow(AuthException::invalidRefresh);
    String hash = CryptoUtil.sha256Hex(raw);

    RefreshToken existing = refreshTokens.findByTokenHash(hash).orElseThrow(AuthException::invalidRefresh);

    Instant now = Instant.now();
    if (existing.isRevoked() || existing.isExpired(now)) {
      throw AuthException.invalidRefresh();
    }

    AuthUser user = users.findById(existing.getUserId()).orElseThrow(AuthException::invalidRefresh);

    // rotate refresh token
    existing.setRevokedAt(now);

    String newRaw = CryptoUtil.randomUrlSafeToken(48);
    String newHash = CryptoUtil.sha256Hex(newRaw);
    Instant exp = now.plus(Duration.ofDays(props.jwt().refreshTtlDays()));
    refreshTokens.save(new RefreshToken(UUID.randomUUID(), user.getId(), newHash, exp));
    cookieService.setRefreshCookie(responseHeaders, newRaw, Duration.ofDays(props.jwt().refreshTtlDays()));

    var access = jwtService.issueAccessToken(user.getId(), user.getEmail(), user.getRoles());
    return new AuthResponse(access.token(), "Bearer", access.expiresInSeconds(), user.getId().toString(), user.getEmail());
  }

  @Transactional
  public void logout(Optional<String> refreshCookie, HttpHeaders responseHeaders) {
    refreshCookie.ifPresent(raw -> {
      String hash = CryptoUtil.sha256Hex(raw);
      refreshTokens.findByTokenHash(hash).ifPresent(rt -> rt.setRevokedAt(Instant.now()));
    });
    cookieService.clearRefreshCookie(responseHeaders);
  }

  private static String normalizeEmail(String email) {
    return email == null ? null : email.trim().toLowerCase();
  }
}
