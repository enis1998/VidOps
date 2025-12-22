package com.vidops.auth.events;

import java.time.Instant;

public record UserRegisteredEvent(
    String eventType,
    int version,
    String userId,
    String email,
    String fullName,
    Instant occurredAt
) {
  public static UserRegisteredEvent v1(String userId, String email, String fullName) {
    return new UserRegisteredEvent("user.registered", 1, userId, email, fullName, Instant.now());
  }
}
