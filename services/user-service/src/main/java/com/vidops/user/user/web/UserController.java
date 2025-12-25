package com.vidops.user.user.web;

import com.vidops.user.user.facade.UserFacade;
import com.vidops.user.user.web.dto.CreateUserRequest;
import com.vidops.user.user.web.dto.UpdateUserRequest;
import com.vidops.user.user.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserFacade userFacade;

    public UserController(UserFacade userFacade) {
        this.userFacade = userFacade;
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
     * Access token içinden userId(email claim’i) okuyup döndürüyoruz.
     */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String email = jwt.getClaimAsString("email");
        return ResponseEntity.ok(new MeResponse(userId, email));
    }

    public record MeResponse(UUID userId, String email) {}
}
