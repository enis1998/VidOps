package com.vidops.user.events;

import com.vidops.user.domain.UserProfile;
import com.vidops.user.repo.UserProfileRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserRegisteredListener {

  private static final Logger log = LoggerFactory.getLogger(UserRegisteredListener.class);
  private final UserProfileRepository profiles;

  public UserRegisteredListener(UserProfileRepository profiles) {
    this.profiles = profiles;
  }

  @Transactional
  @KafkaListener(topics = "user.registered.v1")
  public void onUserRegistered(UserRegisteredEvent event) {
    if (event == null || event.userId() == null) return;

    UUID id = UUID.fromString(event.userId());
    if (profiles.existsById(id)) {
      log.info("User profile already exists for id={}, ignoring event", id);
      return;
    }

    UserProfile profile = new UserProfile(id, event.email(), event.fullName());
    profiles.save(profile);
    log.info("Created user profile id={} email={}", id, event.email());
  }
}
