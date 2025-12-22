package com.vidops.auth.repo;

import com.vidops.auth.domain.AuthUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthUserRepository extends JpaRepository<AuthUser, UUID> {
  Optional<AuthUser> findByEmail(String email);
  boolean existsByEmail(String email);
}
