package com.vidops.user.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vidops.security")
public record VidopsSecurityProperties(Jwt jwt) {

  public record Jwt(
      String issuer,
      String secretBase64
  ) {}
}
