package com.vidops.auth.scheduling;

import com.vidops.auth.service.RefreshTokenService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenCleanupJob {

    private final RefreshTokenService refreshTokenService;

    public RefreshTokenCleanupJob(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }

    @Scheduled(cron = "0 30 3 * * *")
    public void cleanupExpired() {
        refreshTokenService.cleanupExpiredTokens();
    }
}

