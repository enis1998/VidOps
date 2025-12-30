package com.vidops.auth.facede;

import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.exception.InvalidGoogleTokenException;
import com.vidops.auth.mapper.AuthMapper;
import com.vidops.auth.service.AuthService;
import com.vidops.auth.service.RefreshTokenService;
import com.vidops.auth.web.dto.AuthResponse;
import com.vidops.auth.web.dto.GoogleLoginRequest;
import com.vidops.auth.web.dto.LoginRequest;
import com.vidops.auth.web.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthFacadeImpl implements AuthFacade {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final AuthMapper mapper;

    public AuthFacadeImpl(AuthService authService, RefreshTokenService refreshTokenService, AuthMapper mapper) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest req, HttpServletResponse res) {
        AuthUser user = authService.register(req.fullName(), req.email(), req.password());
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
        if (req == null) throw new InvalidGoogleTokenException();

        // @JsonAlias sayesinde "credential" veya "idToken" gelse de buraya düşer.
        String token = req.idToken();
        if (token == null || token.isBlank()) throw new InvalidGoogleTokenException();

        AuthUser user = authService.googleLogin(token);

        String refresh = refreshTokenService.issueAndSetCookie(user.getId(), res);
        return mapper.toAuthResponse(user, authService.issueAccessToken(user), refreshTokenService.getAccessTtlSeconds());
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken, HttpServletResponse res) {
        var userId = refreshTokenService.rotate(refreshToken, res);
        AuthUser user = authService.getUser(userId);
        return mapper.toAuthResponse(user, authService.issueAccessToken(user), refreshTokenService.getAccessTtlSeconds());
    }

    @Override
    @Transactional
    public void logout(String refreshToken, HttpServletResponse res) {
        if (refreshToken != null) refreshTokenService.revoke(refreshToken);
        refreshTokenService.clearCookie(res);
    }
}
