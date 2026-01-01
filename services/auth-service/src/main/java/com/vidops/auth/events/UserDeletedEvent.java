package com.vidops.auth.events;

import java.time.Instant;
import java.util.UUID;

public record UserDeletedEvent(
        UUID userId,
        Instant timestamp
) {}
