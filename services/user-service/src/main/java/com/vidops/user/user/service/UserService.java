package com.vidops.user.user.service;

import com.vidops.user.user.entity.UserProfile;
import com.vidops.user.user.enums.Plan;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface UserService {

    UserProfile create(UserProfile user);

    Optional<UserProfile> get(UUID id);

    UserProfile getOrThrow(UUID id);

    UserProfile update(UUID id, String fullName);

    UserProfile changePlan(UUID id, Plan newPlan);

    void delete(UUID id);

    UserProfile upsertFromAuth(UUID userId, String email, String fullName, Instant createdAt);
}
