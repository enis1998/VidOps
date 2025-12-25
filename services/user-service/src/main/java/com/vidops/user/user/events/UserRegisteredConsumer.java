package com.vidops.user.user.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vidops.user.user.service.UserService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class UserRegisteredConsumer {

    private final ObjectMapper objectMapper;
    private final UserService userService;

    public UserRegisteredConsumer(ObjectMapper objectMapper, UserService userService) {
        this.objectMapper = objectMapper;
        this.userService = userService;
    }

    /**
     * BU bir controller değil.
     * Kafka consumer thread'i bu metodu, topic'e mesaj gelince otomatik çağırır.
     */
    @KafkaListener(topics = "user.registered", groupId = "user-service")
    public void onMessage(byte[] payload) {
        try {
            UserRegisteredEvent e = objectMapper.readValue(payload, UserRegisteredEvent.class);

            userService.upsertFromAuth(
                    e.userId(),
                    e.email(),
                    e.fullName(),
                    e.timestamp()
            );
        } catch (Exception ex) {
            // Prod'da: log + DLQ (dead letter queue) düşünülür.
            throw new RuntimeException("Failed to consume user.registered", ex);
        }
    }
}
