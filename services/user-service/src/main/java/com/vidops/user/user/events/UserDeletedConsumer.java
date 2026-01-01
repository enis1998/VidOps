package com.vidops.user.user.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vidops.user.user.service.UserService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class UserDeletedConsumer {

    private final ObjectMapper objectMapper;
    private final UserService userService;

    public UserDeletedConsumer(ObjectMapper objectMapper, UserService userService) {
        this.objectMapper = objectMapper;
        this.userService = userService;
    }

    @KafkaListener(topics = "user.deleted", groupId = "user-service")
    public void onMessage(byte[] payload) {
        try {
            UserDeletedEvent e = objectMapper.readValue(payload, UserDeletedEvent.class);
            userService.delete(e.userId());
        } catch (Exception ex) {
            throw new RuntimeException("Failed to consume user.deleted", ex);
        }
    }
}
