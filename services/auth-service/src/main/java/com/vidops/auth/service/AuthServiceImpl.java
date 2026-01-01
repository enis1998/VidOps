package com.vidops.auth.service;

import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.enums.AuthProvider;
import com.vidops.auth.events.UserDeletedEvent;
import com.vidops.auth.events.UserEventPublisher;
import com.vidops.auth.events.UserRegisteredEvent;
import com.vidops.auth.exception.*;
import com.vidops.auth.repository.AuthUserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
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
    private final JwtDecoder googleJwtDecoder;
    private final UserEventPublisher userEventPublisher;
    private final EmailVerificationService emailVerificationService;

    public AuthServiceImpl(
            AuthUserRepository authUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Qualifier("googleJwtDecoder") JwtDecoder googleJwtDecoder,
            UserEventPublisher userEventPublisher,
            EmailVerificationService emailVerificationService
    ) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleJwtDecoder = googleJwtDecoder;
        this.userEventPublisher = userEventPublisher;
        this.emailVerificationService = emailVerificationService;
    }

    @Override
    @Transactional
    public AuthUser register(String fullName, String email, String password) {
        authUserRepository.findByEmail(email).ifPresent(u -> {
            throw new DuplicateEmailException(email);
        });

        AuthUser user = AuthUser.createLocal(email, passwordEncoder.encode(password));
        AuthUser saved = authUserRepository.save(user);

        // Profile ismi kaybolmasın diye event'i register'da publish ediyoruz
        String safeFullName = normalizeFullName(fullName, email);
        userEventPublisher.publishUserRegistered(new UserRegisteredEvent(
                saved.getId(),
                saved.getEmail(),
                safeFullName,
                Instant.now()
        ));

        emailVerificationService.sendVerification(saved);

        return saved;
    }

    @Override
    @Transactional
    public void requestEmailVerification(String email) {
        if (email == null || email.isBlank()) return;

        AuthUser u = authUserRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        if (u.isEmailVerified()) return;

        emailVerificationService.sendVerification(u);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        emailVerificationService.verify(token);
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

        if (!user.isEmailVerified()) {
            // ApiExceptionHandler bunu 403 + email_not_verified JSON'a çeviriyor
            throw new IllegalStateException("email_not_verified");
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
    public void deleteAccount(UUID userId) {
        getUser(userId);
        authUserRepository.deleteById(userId);

        userEventPublisher.publishUserDeleted(new UserDeletedEvent(
                userId,
                Instant.now()
        ));
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        AuthUser user = authUserRepository.findById(userId).orElseThrow(() -> new UserNotFoundException());

        if (user.getProvider() == null || user.getProvider().name().equals("GOOGLE")) {
            throw new PasswordChangeNotAllowedException();
        }

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new PasswordChangeNotAllowedException();
        }

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new CurrentPasswordInvalidException();
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        authUserRepository.save(user);
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

        String safeFullName = normalizeFullName(fullName, email);

        var existingOpt = authUserRepository.findByEmail(email);
        if (existingOpt.isPresent()) {
            AuthUser existing = existingOpt.get();

            if (existing.getProvider() != AuthProvider.GOOGLE) {
                throw new DuplicateEmailException(email);
            }

            // Google tarafında profile ensure etmek için event tekrar publish edilebilir (idempotent olmalı)
            userEventPublisher.publishUserRegistered(new UserRegisteredEvent(
                    existing.getId(),
                    existing.getEmail(),
                    safeFullName,
                    Instant.now()
            ));

            return existing;
        }

        AuthUser created = AuthUser.createGoogle(email);
        AuthUser saved = authUserRepository.save(created);

        userEventPublisher.publishUserRegistered(new UserRegisteredEvent(
                saved.getId(),
                saved.getEmail(),
                safeFullName,
                Instant.now()
        ));

        return saved;
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
