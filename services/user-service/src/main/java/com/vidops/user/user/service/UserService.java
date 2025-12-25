package com.vidops.user.user.service;

import com.vidops.user.user.entity.UserProfile;
import com.vidops.user.user.enums.Plan;

import java.util.UUID;

public interface UserService {
    UserProfile create(UserProfile user);  // create: entity geliyor
    UserProfile get(UUID id);
    UserProfile update(UUID id, String fullName, Plan plan, Integer credits);
    void delete(UUID id);
}
