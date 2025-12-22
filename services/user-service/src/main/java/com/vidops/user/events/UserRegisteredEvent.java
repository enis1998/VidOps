package com.vidops.user.events;

import java.time.Instant;

public record UserRegisteredEvent(
    String eventType,
    int version,
    String userId,
    String email,
    String fullName,
    Instant occurredAt
) {}
