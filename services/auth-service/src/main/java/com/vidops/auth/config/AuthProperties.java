package com.vidops.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vidops.security")
public record AuthProperties(
        Jwt jwt,
        Cookies cookies
) {
    public record Jwt(
            String issuer,
            String secretBase64,
            long accessTtlMinutes,
            long refreshTtlDays
    ) {
        public long accessTtlSeconds() {
            return accessTtlMinutes * 60L;
        }
    }

    public record Cookies(
            String refreshCookieName,
            boolean secure,
            String path,
            String domain,
            String sameSite
    ) { }
}
