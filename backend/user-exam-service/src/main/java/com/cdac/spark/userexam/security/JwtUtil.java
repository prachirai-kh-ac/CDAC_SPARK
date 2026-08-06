package com.cdac.spark.userexam.security;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {

    @Value("${jwt.expiration:86400000}")
    private long expTime;

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String key;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        secretKey = Keys.hmacShaKeyFor(key.getBytes());
    }

    public String generateJwt(CustomUserDetailsImpl userDetails) {
        Date iat = new Date();
        Date expiresAt = new Date(iat.getTime() + expTime);

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(iat)
                .setExpiration(expiresAt)
                .addClaims(Map.of(
                        "user_id", userDetails.getUser().getUserId(), 
                        "user_role", userDetails.getUser().getRole()
                ))
                .signWith(secretKey)
                .compact();
    }

    public Claims validateToken(String jwt) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(jwt)
                .getBody();
    }
}

