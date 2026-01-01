package com.vidops.auth.facede;

import com.vidops.auth.web.dto.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.UUID;

public interface AuthFacade {

    void register(RegisterRequest req);

    void verifyEmail(String token);

    void resendVerification(String email);

    AuthResponse login(LoginRequest req, HttpServletResponse res);

    AuthResponse googleLogin(GoogleLoginRequest req, HttpServletResponse res);

    AuthResponse refresh(String refreshToken, HttpServletResponse res);

    void logout(String refreshToken, HttpServletResponse res);

    void deleteAccount(UUID userId, String refreshToken, HttpServletResponse res);

    void changePassword(UUID userId, ChangePasswordRequest req, HttpServletResponse res);
}
