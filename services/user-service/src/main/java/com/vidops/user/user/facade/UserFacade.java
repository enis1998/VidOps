package com.vidops.user.user.facade;

import com.vidops.user.user.web.dto.CreateUserRequest;
import com.vidops.user.user.web.dto.UpdateUserRequest;
import com.vidops.user.user.web.dto.UserResponse;

import java.util.UUID;

public interface UserFacade {
    UserResponse create(CreateUserRequest req);
    UserResponse get(UUID id);
    UserResponse update(UUID id, UpdateUserRequest req);
    void delete(UUID id);
}
