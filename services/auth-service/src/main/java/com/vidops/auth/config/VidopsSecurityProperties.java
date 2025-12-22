package com.vidops.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vidops.security")
public record VidopsSecurityProperties(Jwt jwt, Cookies cookies) {

  public record Jwt(
      String issuer,
      String secretBase64,
      int accessTtlMinutes,
      int refreshTtlDays
  ) {}

  public record Cookies(
      String refreshCookieName
  ) {}
}
