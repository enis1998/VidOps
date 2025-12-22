package com.vidops.user.api;

import com.vidops.user.api.dto.UserMeResponse;
import com.vidops.user.repo.UserProfileRepository;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserProfileRepository profiles;

  public UserController(UserProfileRepository profiles) {
    this.profiles = profiles;
  }

  @GetMapping("/me")
  public ResponseEntity<UserMeResponse> me(@AuthenticationPrincipal Jwt jwt) {
    UUID id = UUID.fromString(jwt.getSubject());
    var profile = profiles.findById(id).orElseThrow();
    return ResponseEntity.ok(new UserMeResponse(
        profile.getId().toString(),
        profile.getEmail(),
        profile.getFullName(),
        profile.getPlan(),
        profile.getCredits()
    ));
  }
}
