package com.vidops.auth.service;

import com.vidops.auth.entity.AuthUser;
import com.vidops.auth.repository.AuthUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private final AuthUserRepository repo;
    private final JavaMailSender mailSender;

    @Value("${vidops.public-url:http://localhost:8090}")
    private String publicUrl;

    @Value("${vidops.mail.from:no-reply@aiboxio.local}")
    private String from;

    private final SecureRandom random = new SecureRandom();

    public EmailVerificationServiceImpl(AuthUserRepository repo, JavaMailSender mailSender) {
        this.repo = repo;
        this.mailSender = mailSender;
    }

    @Override
    @Transactional
    public void sendVerification(AuthUser user) {
        String token = generateToken();
        String hash = sha256Base64Url(token);

        Instant expiresAt = Instant.now().plus(Duration.ofHours(24));
        user.markVerificationRequested(hash, expiresAt);
        repo.save(user);

        String verifyLink = publicUrl + "/verify-email?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(user.getEmail());
        msg.setSubject("aiboxio • Email doğrulama");
        msg.setText(
                "Merhaba,\n\n" +
                        "Email adresini doğrulamak için linke tıkla:\n" +
                        verifyLink + "\n\n" +
                        "Bu link 24 saat geçerlidir.\n"
        );

        mailSender.send(msg);
    }

    @Override
    @Transactional
    public AuthUser verify(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("token_missing");
        }

        String hash = sha256Base64Url(rawToken);
        AuthUser user = repo.findByEmailVerificationTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("token_invalid"));

        Instant exp = user.getEmailVerificationExpiresAt();
        if (exp == null || exp.isBefore(Instant.now())) {
            throw new IllegalArgumentException("token_expired");
        }

        user.markVerified();
        return repo.save(user);
    }

    @Override
    public String generateToken() {
        byte[] b = new byte[32];
        random.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    @Override
    public String sha256Base64Url(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] out = md.digest(s.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(out);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
