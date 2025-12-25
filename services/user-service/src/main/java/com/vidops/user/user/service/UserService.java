package com.vidops.user.user.service;

import com.vidops.user.user.entity.UserProfile;
import com.vidops.user.user.enums.Plan;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface UserService {

    UserProfile create(UserProfile user);

    Optional<UserProfile> get(UUID id);

    /**
     * Facade mapper'a UserProfile vermek istediği için helper.
     * Bulamazsa exception fırlatır.
     */
    UserProfile getOrThrow(UUID id);

    /**
     * Sadece alan güncellemek için: fullName/plan/credits.
     */
    UserProfile update(UUID id, String fullName, Plan plan, Integer credits);

    /**
     * Komple entity save etmek istersen.
     */
    UserProfile update(UserProfile user);

    void delete(UUID id);

    UserProfile upsertFromAuth(UUID userId, String email, String fullName, Instant createdAt);
}
