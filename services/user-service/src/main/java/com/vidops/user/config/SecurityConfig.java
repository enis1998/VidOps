package com.vidops.user.config;

import java.util.Base64;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

  @Bean
  JwtDecoder jwtDecoder(VidopsSecurityProperties props) {
    String base64 = props.jwt().secretBase64();
    if (base64 == null || base64.isBlank()) {
      throw new IllegalStateException("JWT_SECRET_BASE64 is required");
    }
    byte[] keyBytes = Base64.getDecoder().decode(base64);
    SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");

    NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).build();

    OAuth2TokenValidator<Jwt> withIssuer = jwt -> {
      String iss = jwt.getIssuer() != null ? jwt.getIssuer().toString() : null;
      if (props.jwt().issuer().equals(iss)) return OAuth2TokenValidatorResult.success();
      return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Invalid issuer", null));
    };
    decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), withIssuer));
    return decoder;
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
            .anyRequest().denyAll()
        )
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));
    return http.build();
  }
}
