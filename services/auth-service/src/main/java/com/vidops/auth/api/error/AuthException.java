package com.vidops.auth.api.error;

import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {
  private final HttpStatus status;
  private final String code;

  public AuthException(HttpStatus status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
  }

  public HttpStatus getStatus() { return status; }
  public String getCode() { return code; }

  public static AuthException badCredentials() {
    return new AuthException(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS", "Invalid email or password.");
  }

  public static AuthException emailTaken() {
    return new AuthException(HttpStatus.CONFLICT, "EMAIL_TAKEN", "This email is already registered.");
  }

  public static AuthException invalidRefresh() {
    return new AuthException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH", "Refresh token is invalid or expired.");
  }
}
