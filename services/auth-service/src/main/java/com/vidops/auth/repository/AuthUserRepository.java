package com.vidops.auth.repository;

import com.vidops.auth.entity.AuthUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthUserRepository extends JpaRepository<AuthUser, UUID> {
    Optional<AuthUser> findByEmail(String email);
    Optional<AuthUser> findByEmailVerificationTokenHash(String tokenHash);
}
