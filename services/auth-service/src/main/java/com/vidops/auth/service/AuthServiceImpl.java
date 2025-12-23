package com.vidops.auth.service;

import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.enums.AuthProvider;
import com.vidops.auth.events.UserEventPublisher;
import com.vidops.auth.events.UserRegisteredEvent;
import com.vidops.auth.repository.AuthUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {
    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtDecoder googleJwtDecoder;
    private final UserEventPublisher eventPublisher;

    public AuthServiceImpl(AuthUserRepository authUserRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           JwtDecoder googleJwtDecoder,
                           UserEventPublisher eventPublisher) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleJwtDecoder = googleJwtDecoder;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public AuthUser register(String email, String rawPassword) {
        authUserRepository.findByEmail(email).ifPresent(u -> { throw new DuplicateEmailException(email); });

        AuthUser user = AuthUser.local(email, passwordEncoder.encode(rawPassword));
        AuthUser saved = authUserRepository.save(user);

        eventPublisher.publishUserRegistered(new UserRegisteredEvent(saved.getId(), saved.getEmail(), null));
        return saved;
    }

    @Override
    public AuthUser login(String email, String rawPassword) {
        AuthUser user = authUserRepository.findByEmail(email).orElseThrow(InvalidCredentialsException::new);

        if (user.getProvider() != AuthProvider.LOCAL) throw new InvalidCredentialsException();
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) throw new InvalidCredentialsException();

        return user;
    }

    @Override
    public AuthUser googleLogin(String idToken) {
        Jwt jwt = googleJwtDecoder.decode(idToken);

        String email = jwt.getClaimAsString("email");
        Boolean verified = jwt.getClaim("email_verified");
        String name = jwt.getClaimAsString("name");

        if (email == null || Boolean.FALSE.equals(verified)) throw new InvalidCredentialsException();

        return authUserRepository.findByEmail(email).orElseGet(() -> {
            AuthUser u = AuthUser.google(email);
            AuthUser saved = authUserRepository.save(u);
            eventPublisher.publishUserRegistered(new UserRegisteredEvent(saved.getId(), saved.getEmail(), name));
            return saved;
        });
    }

    @Override
    public AuthUser getUser(UUID userId) {
        return authUserRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
    }

    @Override
    public String issueAccessToken(AuthUser user) {
        return jwtService.issueAccessToken(user.getId(), user.getEmail(), user.getRoles());
    }
}