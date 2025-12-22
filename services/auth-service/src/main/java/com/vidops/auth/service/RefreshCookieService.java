package com.vidops.auth.service;

import com.vidops.auth.config.VidopsSecurityProperties;
import java.time.Duration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class RefreshCookieService {

  private final VidopsSecurityProperties props;

  public RefreshCookieService(VidopsSecurityProperties props) {
    this.props = props;
  }

  public void setRefreshCookie(HttpHeaders headers, String refreshTokenRaw, Duration ttl) {
    ResponseCookie cookie = ResponseCookie.from(props.cookies().refreshCookieName(), refreshTokenRaw)
        .httpOnly(true)
        .secure(false) // set true behind HTTPS in prod
        .sameSite("Lax")
        .path("/api/auth")
        .maxAge(ttl)
        .build();
    headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
  }

  public void clearRefreshCookie(HttpHeaders headers) {
    ResponseCookie cookie = ResponseCookie.from(props.cookies().refreshCookieName(), "")
        .httpOnly(true)
        .secure(false)
        .sameSite("Lax")
        .path("/api/auth")
        .maxAge(Duration.ZERO)
        .build();
    headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
  }
}
