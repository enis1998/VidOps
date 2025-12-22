package com.vidops.auth.service;

import com.vidops.auth.config.VidopsSecurityProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final JwtEncoder encoder;
  private final VidopsSecurityProperties props;

  public JwtService(JwtEncoder encoder, VidopsSecurityProperties props) {
    this.encoder = encoder;
    this.props = props;
  }

  public TokenIssueResult issueAccessToken(UUID userId, String email, String rolesCsv) {
    Instant now = Instant.now();
    Duration ttl = Duration.ofMinutes(props.jwt().accessTtlMinutes());
    Instant exp = now.plus(ttl);

    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer(props.jwt().issuer())
        .issuedAt(now)
        .expiresAt(exp)
        .subject(userId.toString())
        .claim("email", email)
        .claim("roles", rolesCsv)
        .build();

    var headers = JwsHeader.with(MacAlgorithm.HS256).build();
    String token = encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    return new TokenIssueResult(token, ttl.getSeconds());
  }

  public record TokenIssueResult(String token, long expiresInSeconds) {}
}
