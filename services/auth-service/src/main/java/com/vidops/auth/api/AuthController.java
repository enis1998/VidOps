package com.vidops.auth.api;

import com.vidops.auth.api.dto.AuthResponse;
import com.vidops.auth.api.dto.LoginRequest;
import com.vidops.auth.api.dto.RegisterRequest;
import com.vidops.auth.service.AuthApplicationService;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  /**
   * Keep this aligned with `vidops.security.cookies.refresh-cookie-name`.
   * (Spring MVC's @CookieValue doesn't support injecting config directly.)
   */
  private static final String REFRESH_COOKIE = "VIDOPS_REFRESH";

  private final AuthApplicationService auth;

  public AuthController(AuthApplicationService auth) {
    this.auth = auth;
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
    HttpHeaders headers = new HttpHeaders();
    AuthResponse res = auth.register(req, headers);
    return ResponseEntity.ok().headers(headers).body(res);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
    HttpHeaders headers = new HttpHeaders();
    AuthResponse res = auth.login(req, headers);
    return ResponseEntity.ok().headers(headers).body(res);
  }

  @PostMapping("/refresh")
  public ResponseEntity<AuthResponse> refresh(
      @CookieValue(name = REFRESH_COOKIE, required = false) String refreshCookie
  ) {
    HttpHeaders headers = new HttpHeaders();
    AuthResponse res = auth.refresh(Optional.ofNullable(refreshCookie), headers);
    return ResponseEntity.ok().headers(headers).body(res);
  }

  @PostMapping("/logout")
  public ResponseEntity<Void> logout(
      @CookieValue(name = REFRESH_COOKIE, required = false) String refreshCookie
  ) {
    HttpHeaders headers = new HttpHeaders();
    auth.logout(Optional.ofNullable(refreshCookie), headers);
    return ResponseEntity.noContent().headers(headers).build();
  }
}
