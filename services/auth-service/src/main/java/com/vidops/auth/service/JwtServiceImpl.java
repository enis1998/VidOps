package com.vidops.auth.service;

import com.vidops.auth.config.AuthProperties;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class JwtServiceImpl implements JwtService {

    private final JwtEncoder encoder;
    private final AuthProperties props;

    public JwtServiceImpl(JwtEncoder encoder, AuthProperties props) {
        this.encoder = encoder;
        this.props = props;
    }

    @Override
    public String issueAccessToken(UUID userId, String email, String rolesCsv) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.jwt().accessTtlSeconds());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(props.jwt().issuer())
                .issuedAt(now)
                .expiresAt(exp)
                .subject(userId.toString())
                .claim("email", email)
                .claim("roles", rolesCsv) // "USER,ADMIN"
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
