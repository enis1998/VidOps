package com.vidops.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vidops.auth")
public record AuthProperties(
        Jwt jwt,
        Refresh refresh,
        Cookie cookie
) {
    public record Jwt(
            String issuer,
            String secretBase64,
            long accessTtlSeconds
    ) {}

    public record Refresh(
            long ttlSeconds,
            boolean rotate
    ) {}

    public record Cookie(
            String refreshName,
            String path,
            boolean secure,
            String sameSite
    ) {}
}
