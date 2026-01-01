package com.vidops.auth.facede;

import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.mapper.AuthMapper;
import com.vidops.auth.service.AuthService;
import com.vidops.auth.service.RefreshTokenService;
import com.vidops.auth.web.dto.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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
    public void register(RegisterRequest req) {
        authService.register(req.fullName(), req.email(), req.password());
        // NOT: register sonrası token/cookie yok. Email doğrulama linki ile devam.
    }

    @Override
    public void verifyEmail(String token) {
        authService.verifyEmail(token);
    }

    @Override
    public void resendVerification(String email) {
        authService.requestEmailVerification(email);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req, HttpServletResponse res) {
        AuthUser user = authService.login(req.email(), req.password());

        // login -> refresh cookie set
        refreshTokenService.issueAndSetCookie(user.getId(), res);

        return mapper.toAuthResponse(
                user,
                authService.issueAccessToken(user),
                refreshTokenService.getAccessTtlSeconds()
        );
    }

    @Override
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest req, HttpServletResponse res) {
        // ✅ record alanını kullan
        String token = req.idToken();

        AuthUser user = authService.googleLogin(token);

        // google login -> refresh cookie set
        refreshTokenService.issueAndSetCookie(user.getId(), res);

        return mapper.toAuthResponse(
                user,
                authService.issueAccessToken(user),
                refreshTokenService.getAccessTtlSeconds()
        );
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken, HttpServletResponse res) {
        // ✅ interface’e uygun: rotate(refreshToken, res)
        UUID userId = refreshTokenService.rotate(refreshToken, res);

        AuthUser user = authService.getUser(userId);

        return mapper.toAuthResponse(
                user,
                authService.issueAccessToken(user),
                refreshTokenService.getAccessTtlSeconds()
        );
    }

    @Override
    @Transactional
    public void logout(String refreshToken, HttpServletResponse res) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revoke(refreshToken);
        }
        refreshTokenService.clearCookie(res);
    }

    @Override
    @Transactional
    public void deleteAccount(UUID userId, String refreshToken, HttpServletResponse res) {
        // refresh cookie + db tokenları temizle
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revoke(refreshToken);
        }
        refreshTokenService.revokeAll(userId);
        refreshTokenService.clearCookie(res);

        // auth user sil + user.deleted event publish (service içinde)
        authService.deleteAccount(userId);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest req, HttpServletResponse res) {
        authService.changePassword(userId, req.currentPassword(), req.newPassword());

        refreshTokenService.revokeAll(userId);
        refreshTokenService.clearCookie(res);
    }
}
