package com.vidops.auth.web;

import com.vidops.auth.facede.AuthFacade;
import com.vidops.auth.web.dto.AuthResponse;
import com.vidops.auth.web.dto.GoogleLoginRequest;
import com.vidops.auth.web.dto.LoginRequest;
import com.vidops.auth.web.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthFacade contract;

    public AuthController(AuthFacade contract) {
        this.contract = contract;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse res) {
        return ResponseEntity.ok(contract.register(req, res));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req, HttpServletResponse res) {
        return ResponseEntity.ok(contract.login(req, res));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleLoginRequest req, HttpServletResponse res) {
        return ResponseEntity.ok(contract.googleLogin(req, res));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = "refresh_token", required = false) String refreshToken,
                                                HttpServletResponse res) {
        return ResponseEntity.ok(contract.refresh(refreshToken, res));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "refresh_token", required = false) String refreshToken,
                                       HttpServletResponse res) {
        contract.logout(refreshToken, res);
        return ResponseEntity.noContent().build();
    }
}
