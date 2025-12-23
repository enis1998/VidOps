package com.vidops.auth.facede;

import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.mapper.AuthMapper;
import com.vidops.auth.service.AuthService;
import com.vidops.auth.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthFacadeImpl implements AuthFacade {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final AuthMapper mapper;

    public AuthContractImpl(AuthService authService, RefreshTokenService refreshTokenService, AuthMapper mapper) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest req, HttpServletResponse res) {
        AuthUser user = authService.register(req.email(), req.password());
        String refresh = refreshTokenService.issueAndSetCookie(user.getId(), res);
        return mapper.toAuthResponse(user, authService.issueAccessToken(user), refreshTokenService.getAccessTtlSeconds());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletResponse res) {
        AuthUser user = authService.login(req.email(), req.password());
        String refresh = refreshTokenService.issueAndSetCookie(user.getId(), res);
        return mapper.toAuthResponse(user, authService.issueAccessToken(user), refreshTokenService.getAccessTtlSeconds());
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest req, HttpServletResponse res) {
        AuthUser user = authService.googleLogin(req.idToken());
        String refresh = refreshTokenService.issueAndSetCookie(user.getId(), res);
        return mapper.toAuthResponse(user, authService.issueAccessToken(user), refreshTokenService.getAccessTtlSeconds());
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken, HttpServletResponse res) {
        var userId = refreshTokenService.verify(refreshToken);
        AuthUser user = authService.getUser(userId);

        // rotate refresh token (opsiyonel ama recommended)
        refreshTokenService.revoke(refreshToken);
        String newRefresh = refreshTokenService.issueAndSetCookie(user.getId(), res);

        return mapper.toAuthResponse(user, authService.issueAccessToken(user), refreshTokenService.getAccessTtlSeconds());
    }

    @Override
    @Transactional
    public void logout(String refreshToken, HttpServletResponse res) {
        if (refreshToken != null) refreshTokenService.revoke(refreshToken);
        refreshTokenService.clearCookie(res);
    }
}
