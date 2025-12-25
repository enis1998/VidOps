package com.vidops.user.user.facade;

import com.vidops.user.user.web.dto.CreateUserRequest;
import com.vidops.user.user.web.dto.UpdateUserRequest;
import com.vidops.user.user.web.dto.UserResponse;
import com.vidops.user.user.entity.UserProfile;
import com.vidops.user.user.mapper.UserMapper;
import com.vidops.user.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserFacadeImpl implements UserFacade {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserFacadeImpl(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest req) {
        UserProfile entity = userMapper.toEntity(req);
        UserProfile saved  = userService.create(entity);
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse get(UUID id) {
        UserProfile user = userService.getOrThrow(id);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse update(UUID id, UpdateUserRequest req) {
        UserProfile updated = userService.update(id, req.fullName(), req.plan(), req.credits());
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        userService.delete(id);
    }
}
