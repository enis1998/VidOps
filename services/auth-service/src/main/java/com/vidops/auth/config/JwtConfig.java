package com.vidops.auth.config;

import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
public class JwtConfig {

  @Bean
  JwtEncoder jwtEncoder(VidopsSecurityProperties props) {
    String base64 = props.jwt().secretBase64();
    if (base64 == null || base64.isBlank()) {
      throw new IllegalStateException("JWT_SECRET_BASE64 is required");
    }
    byte[] keyBytes = Base64.getDecoder().decode(base64);
    SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");
    return new NimbusJwtEncoder(new ImmutableSecret<>(key));
  }
}
