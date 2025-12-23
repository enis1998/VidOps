package com.vidops.auth.events;

import java.util.UUID;

public record UserRegisteredEvent(UUID userId, String email, String fullName) {}
