package com.vidops.auth.service;

import com.vidops.auth.entity.AuthUser;

public interface EmailVerificationService {

    void sendVerification(AuthUser user);

    AuthUser verify(String rawToken);

    String generateToken();

    String sha256Base64Url(String s);
}
