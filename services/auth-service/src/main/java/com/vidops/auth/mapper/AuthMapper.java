package com.vidops.auth.mapper;

import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.web.dto.AuthResponse;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public AuthResponse toAuthResponse(AuthUser user, String accessToken, long expiresInSeconds) {
        return new AuthResponse(
                accessToken,
                "Bearer",
                expiresInSeconds,
                user.getId().toString(),
                user.getEmail()
        );
    }
}
