package com.vidops.user.user.web;

import com.vidops.user.user.entity.UserProfile;
import com.vidops.user.user.enums.Plan;
import com.vidops.user.user.facade.UserFacade;
import com.vidops.user.user.mapper.UserMapper;
import com.vidops.user.user.service.UserService;
import com.vidops.user.user.web.dto.CreateUserRequest;
import com.vidops.user.user.web.dto.UpdateUserRequest;
import com.vidops.user.user.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserFacade userFacade;
    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserFacade userFacade, UserService userService, UserMapper userMapper) {
        this.userFacade = userFacade;
        this.userService = userService;
        this.userMapper = userMapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest req) {
        return userFacade.create(req);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable UUID id) {
        return userFacade.get(id);
    }

    @PatchMapping("/{id}")
    public UserResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest req) {
        return userFacade.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        userFacade.delete(id);
    }

    /**
     * Frontend login/register sonrası bunu çağırıyor.
     * Access token içinden userId/email okuyup DB'den profile çekiyoruz.
     * Eğer Kafka consumer henüz yazmadıysa fallback bir response dönüyoruz.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");

        Optional<UserProfile> profile = userService.get(userId);
        if (profile.isPresent()) {
            return ResponseEntity.ok(userMapper.toResponse(profile.get()));
        }

        String fallbackName = deriveNameFromEmail(email);
        return ResponseEntity.ok(new UserResponse(
                userId,
                email,
                fallbackName,
                Plan.FREE,
                0,
                null,
                null
        ));
    }

    private String deriveNameFromEmail(String email) {
        if (email == null || email.isBlank()) return "User";
        int idx = email.indexOf("@");
        String base = (idx > 0) ? email.substring(0, idx) : email;
        if (base.isBlank()) return "User";
        return base.replace(".", " ").replace("_", " ").trim();
    }
}
