package com.vidops.auth.events;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class KafkaUserEventPublisher implements UserEventPublisher {

    private final KafkaTemplate<String, Object> kafka;

    public KafkaUserEventPublisher(KafkaTemplate<String, Object> kafka) {
        this.kafka = kafka;
    }

    @Override
    public void publishUserRegistered(UserRegisteredEvent event) {
        kafka.send("user.registered.v1", event.userId().toString(), event);
    }
}
