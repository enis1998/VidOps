package com.vidops.user.user.mapper;

import com.vidops.user.user.web.dto.CreateUserRequest;
import com.vidops.user.user.web.dto.UserResponse;
import com.vidops.user.user.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfile toEntity(CreateUserRequest req) {
        return new UserProfile(req.email(), req.fullName(), req.plan(), req.credits());
    }

    public UserResponse toResponse(UserProfile u) {
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getPlan(),
                u.getCredits(),
                u.getCreatedAt(),
                u.getUpdatedAt()
        );
    }
}
