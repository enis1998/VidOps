package com.vidops.auth.events;

public interface UserEventPublisher {
    void publishUserRegistered(UserRegisteredEvent event);
    void publishUserDeleted(UserDeletedEvent event);
}
