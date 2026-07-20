package com.rehnoor.certusbackend.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtTokenProvider {
    // Keep the signing key outside source control so tokens remain valid across restarts.
    private final Key jwtSecretKey;

    // 2. Defining Token expiration duration window (eg. 24 hours)
    private final long jwtExpirationInMs = 86400000;

    public JwtTokenProvider(@Value("${app.jwt.secret}") String jwtSecret) {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("APP_JWT_SECRET must be a Base64-encoded value of at least 32 bytes");
        }
        this.jwtSecretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // STEP A: Generate Token when login succeeds
    public String generateToken(Authentication authentication){
        SecurityUser userPrincipal = (SecurityUser) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        // Extract the user's role (ROLE_ADMIN or ROLE_PATIENT)
        String role = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        // Build the signed JWT Structure
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey)
                .compact();         // Serialize to an encoded URL-safe string
    }

    // STEP B: Extract username (email) out of incoming headers
    public String getEmailFromJWT(String token){
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public String getRoleFromJWT(String token){
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("role", String.class);
    }

    // STEP C: Cryptographically validate incoming token integrity
    public boolean validateToken(String authToken){
        try{
            Jwts.parserBuilder().setSigningKey(jwtSecretKey).build().parseClaimsJws(authToken);
            return true;
        } catch(JwtException | IllegalArgumentException ex){
            return false;
        }
    }



}
