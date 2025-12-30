package com.vidops.auth.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.enums.AuthProvider;
import com.vidops.auth.events.UserRegisteredEvent;
import com.vidops.auth.exception.DuplicateEmailException;
import com.vidops.auth.exception.InvalidCredentialsException;
import com.vidops.auth.exception.InvalidGoogleTokenException;
import com.vidops.auth.exception.UserNotFoundException;
import com.vidops.auth.repository.AuthUserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final JwtDecoder googleJwtDecoder;

    public AuthServiceImpl(
            AuthUserRepository authUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            KafkaTemplate<String, byte[]> kafkaTemplate,
            ObjectMapper objectMapper,
            @Qualifier("googleJwtDecoder") JwtDecoder googleJwtDecoder
    ) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.googleJwtDecoder = googleJwtDecoder;
    }

    @Override
    @Transactional
    public AuthUser register(String fullName, String email, String password) {
        authUserRepository.findByEmail(email).ifPresent(u -> {
            throw new DuplicateEmailException(email);
        });

        AuthUser user = AuthUser.createLocal(email, passwordEncoder.encode(password));
        AuthUser saved = authUserRepository.save(user);

        String safeFullName = normalizeFullName(fullName, email);

        publishUserRegistered(saved.getId(), saved.getEmail(), safeFullName);

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
    @Transactional
    public AuthUser googleLogin(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new InvalidGoogleTokenException();
        }

        final Jwt jwt;
        try {
            jwt = googleJwtDecoder.decode(idToken);
        } catch (JwtException | IllegalArgumentException e) {
            throw new InvalidGoogleTokenException();
        }

        String email = jwt.getClaimAsString("email");
        Boolean emailVerified = jwt.getClaimAsBoolean("email_verified");
        String fullName = jwt.getClaimAsString("name");

        if (email == null || email.isBlank()) {
            throw new InvalidGoogleTokenException();
        }
        if (emailVerified != null && !emailVerified) {
            throw new InvalidGoogleTokenException();
        }

        // FullName boşsa fallback
        String safeFullName = normalizeFullName(fullName, email);

        // Aynı email var mı?
        var existingOpt = authUserRepository.findByEmail(email);
        if (existingOpt.isPresent()) {
            AuthUser existing = existingOpt.get();

            // Eğer bu email LOCAL hesapla kayıtlıysa, Google ile login yaptırmak istemiyorsan 409/duplicate at:
            if (existing.getProvider() != AuthProvider.GOOGLE) {
                throw new DuplicateEmailException(email);
            }

            return existing;
        }

        // Yeni Google user oluştur
        AuthUser created = AuthUser.createGoogle(email);
        AuthUser saved = authUserRepository.save(created);

        // user-service profile oluştursun diye event
        publishUserRegistered(saved.getId(), saved.getEmail(), safeFullName);

        return saved;
    }

    private void publishUserRegistered(UUID userId, String email, String fullName) {
        UserRegisteredEvent event = new UserRegisteredEvent(
                userId,
                email,
                fullName,
                Instant.now()
        );

        try {
            byte[] payload = objectMapper.writeValueAsBytes(event);
            kafkaTemplate.send("user.registered", userId.toString(), payload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize UserRegisteredEvent", e);
        }
    }

    private static String normalizeFullName(String fullName, String email) {
        String v = (fullName == null) ? "" : fullName.trim();
        if (!v.isBlank()) return v;

        if (email == null) return "User";
        String left = email.contains("@") ? email.substring(0, email.indexOf("@")) : email;
        left = left.replace('.', ' ').replace('_', ' ').replace('-', ' ').trim();
        if (left.isBlank()) return "User";

        String[] parts = left.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p.isBlank()) continue;
            String t = p.toLowerCase(Locale.ROOT);
            sb.append(Character.toUpperCase(t.charAt(0))).append(t.substring(1)).append(' ');
        }
        String out = sb.toString().trim();
        return out.isBlank() ? "User" : out;
    }
}
