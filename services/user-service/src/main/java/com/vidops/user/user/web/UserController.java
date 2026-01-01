package com.vidops.user.user.web;

import com.vidops.user.user.entity.UserProfile;
import com.vidops.user.user.facade.UserFacade;
import com.vidops.user.user.mapper.UserMapper;
import com.vidops.user.user.service.UserService;
import com.vidops.user.user.web.dto.ChangePlanRequest;
import com.vidops.user.user.web.dto.CreateUserRequest;
import com.vidops.user.user.web.dto.UpdateUserRequest;
import com.vidops.user.user.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    public UserResponse get(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        assertSelf(id, jwt);
        return userFacade.get(id);
    }

    @PatchMapping("/{id}")
    public UserResponse update(@PathVariable UUID id,
                               @Valid @RequestBody UpdateUserRequest req,
                               @AuthenticationPrincipal Jwt jwt) {
        assertSelf(id, jwt);
        return userFacade.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        assertSelf(id, jwt);
        userFacade.delete(id);
    }

    /**
     * Frontend login/register sonrası bunu çağırıyor.
     * Access token içinden userId/email okuyup DB'den profile çekiyoruz.
     * Eğer Kafka consumer henüz yazmadıysa burada self-heal yapıp DB'ye upsert ediyoruz.
     */
    @GetMapping("/account")
    public ResponseEntity<UserResponse> account(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = requireUserId(jwt);
        String email = jwt.getClaimAsString("email");

        Optional<UserProfile> profile = userService.get(userId);
        if (profile.isPresent()) {
            return ResponseEntity.ok(userMapper.toResponse(profile.get()));
        }

        UserProfile created = userService.upsertFromAuth(userId, email, null, null);
        return ResponseEntity.ok(userMapper.toResponse(created));
    }

    /**
     * UI profil düzenleme için:
     * PATCH /api/users/me
     */
    @PatchMapping("/account")
    public UserResponse updateAccount(@Valid @RequestBody UpdateUserRequest req,
                                      @AuthenticationPrincipal Jwt jwt) {
        UUID userId = requireUserId(jwt);
        return userFacade.update(userId, req);
    }

    @PatchMapping("/account/plan")
    public UserResponse changePlan(@Valid @RequestBody ChangePlanRequest req,
                                   @AuthenticationPrincipal Jwt jwt) {
        UUID userId = requireUserId(jwt);
        UserProfile updated = userService.changePlan(userId, req.getPlan());
        return userMapper.toResponse(updated);
    }


    private void assertSelf(UUID id, Jwt jwt) {
        UUID me = requireUserId(jwt);
        if (!me.equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can access only your own profile");
        }
    }

    private UUID requireUserId(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        try {
            return UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token subject");
        }
    }
}
