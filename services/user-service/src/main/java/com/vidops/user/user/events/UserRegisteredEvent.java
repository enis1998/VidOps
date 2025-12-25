package com.vidops.user.user.events;

import java.time.Instant;
import java.util.UUID;

public record UserRegisteredEvent(
        UUID userId,
        String email,
        String fullName,
        Instant timestamp
) {}
