package com.vidops.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class CryptoUtil {
  private static final SecureRandom RNG = new SecureRandom();

  private CryptoUtil() {}

  public static String randomUrlSafeToken(int bytes) {
    byte[] b = new byte[bytes];
    RNG.nextBytes(b);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
  }

  public static String sha256Hex(String input) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] dig = md.digest(input.getBytes(StandardCharsets.UTF_8));
      StringBuilder sb = new StringBuilder(dig.length * 2);
      for (byte x : dig) sb.append(String.format("%02x", x));
      return sb.toString();
    } catch (Exception e) {
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }
}
