package com.vidops.auth.repository;

import com.vidops.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    long deleteByExpiresAtBefore(java.time.Instant now);
    long deleteByUserId(UUID userId);
}
