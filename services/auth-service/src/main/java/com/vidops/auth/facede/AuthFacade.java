package com.vidops.auth.facede;

import com.vidops.auth.web.dto.AuthResponse;
import com.vidops.auth.web.dto.GoogleLoginRequest;
import com.vidops.auth.web.dto.LoginRequest;
import com.vidops.auth.web.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthFacade {
    AuthResponse register(RegisterRequest req, HttpServletResponse res);
    AuthResponse login(LoginRequest req, HttpServletResponse res);
    AuthResponse googleLogin(GoogleLoginRequest req, HttpServletResponse res);
    AuthResponse refresh(String refreshToken, HttpServletResponse res);
    void logout(String refreshToken, HttpServletResponse res);
}
