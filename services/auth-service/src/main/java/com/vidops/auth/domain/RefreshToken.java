package com.vidops.auth.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

  @Id
  private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "token_hash", nullable = false, unique = true)
  private String tokenHash;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "revoked_at")
  private Instant revokedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  public RefreshToken() {}

  public RefreshToken(UUID id, UUID userId, String tokenHash, Instant expiresAt) {
    this.id = id;
    this.userId = userId;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
  }

  public UUID getId() { return id; }
  public UUID getUserId() { return userId; }
  public String getTokenHash() { return tokenHash; }
  public Instant getExpiresAt() { return expiresAt; }
  public Instant getRevokedAt() { return revokedAt; }
  public Instant getCreatedAt() { return createdAt; }

  public void setId(UUID id) { this.id = id; }
  public void setUserId(UUID userId) { this.userId = userId; }
  public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
  public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
  public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }

  public boolean isRevoked() { return revokedAt != null; }
  public boolean isExpired(Instant now) { return expiresAt.isBefore(now); }
}
