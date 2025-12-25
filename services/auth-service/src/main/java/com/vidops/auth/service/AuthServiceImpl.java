package com.vidops.auth.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.enums.AuthProvider;
import com.vidops.auth.events.UserRegisteredEvent;
import com.vidops.auth.exception.DuplicateEmailException;
import com.vidops.auth.exception.InvalidCredentialsException;
import com.vidops.auth.exception.UserNotFoundException;
import com.vidops.auth.repository.AuthUserRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public AuthServiceImpl(
            AuthUserRepository authUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            KafkaTemplate<String, byte[]> kafkaTemplate,
            ObjectMapper objectMapper
    ) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public AuthUser register(String fullName, String email, String password) {
        authUserRepository.findByEmail(email).ifPresent(u -> {
            throw new DuplicateEmailException(email);
        });

        AuthUser user = AuthUser.createLocal(email, passwordEncoder.encode(password));
        AuthUser saved = authUserRepository.save(user);

        // Kafka event publish
        UserRegisteredEvent event = new UserRegisteredEvent(
                saved.getId(),
                saved.getEmail(),
                fullName,
                Instant.now()
        );

        try {
            byte[] payload = objectMapper.writeValueAsBytes(event);
            kafkaTemplate.send("user.registered", saved.getId().toString(), payload);
        } catch (JsonProcessingException e) {
            // İstersen burada loglayıp swallow edebilirsin, ama en azından uygulamayı çökertmesin.
            // RuntimeException fırlatırsan register da fail olur.
            throw new RuntimeException("Failed to serialize UserRegisteredEvent", e);
        }

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthUser login(String email, String password) {
        AuthUser user = authUserRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new InvalidCredentialsException();
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthUser getUser(UUID userId) {
        return authUserRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
    }

    @Override
    public String issueAccessToken(AuthUser user) {
        String rolesCsv = "";
        return jwtService.issueAccessToken(user.getId(), user.getEmail(), rolesCsv);
    }

    @Override
    public AuthUser googleLogin(String idToken) {
        throw new UnsupportedOperationException("Google login is not implemented yet");
    }
}
