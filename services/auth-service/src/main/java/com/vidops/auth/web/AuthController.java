package com.vidops.auth.web;

import com.vidops.auth.facede.AuthFacade;
import com.vidops.auth.web.dto.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthFacade contract;

    public AuthController(AuthFacade contract) {
        this.contract = contract;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse res) {
        contract.register(req);
        return ResponseEntity.status(201).body(new RegisterResponse("Kayıt oluşturuldu. Lütfen email doğrulama bağlantısını kontrol et."));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam("token") String token) {
        contract.verifyEmail(token);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email/resend")
    public ResponseEntity<Void> resend(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        contract.resendVerification(email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req, HttpServletResponse res) {
        return ResponseEntity.ok(contract.login(req, res));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@RequestBody GoogleLoginRequest req, HttpServletResponse res) {
        return ResponseEntity.ok(contract.googleLogin(req, res));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "${vidops.security.cookies.refresh-cookie-name:VIDOPS_REFRESH}", required = false) String refreshToken,
            HttpServletResponse res
    ) {
        return ResponseEntity.ok(contract.refresh(refreshToken, res));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "${vidops.security.cookies.refresh-cookie-name:VIDOPS_REFRESH}", required = false) String refreshToken,
            HttpServletResponse res
    ) {
        contract.logout(refreshToken, res);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/account/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest req,
            HttpServletResponse res
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        contract.changePassword(userId, req, res);
        return ResponseEntity.noContent().build();
    }

    /**
     * Backward compatible endpoint.
     * Frontend (older) calls: POST /api/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePasswordLegacy(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest req,
            HttpServletResponse res
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        contract.changePassword(userId, req, res);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(
            @AuthenticationPrincipal Jwt jwt,
            @CookieValue(name = "${vidops.security.cookies.refresh-cookie-name:VIDOPS_REFRESH}", required = false) String refreshToken,
            HttpServletResponse res
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        contract.deleteAccount(userId, refreshToken, res);
        return ResponseEntity.noContent().build();
    }
}
