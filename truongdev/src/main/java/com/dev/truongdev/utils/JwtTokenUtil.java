package com.dev.truongdev.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenUtil {

  @Value("${app.jwt.secret}")
  private String SECRET_KEY;

  private Key getSigningKey() {
    return new SecretKeySpec(Base64.getDecoder().decode(SECRET_KEY), SignatureAlgorithm.HS256.getJcaName());
  }

  public String generateToken(String subject, Map<String, Object> claims, int expirationTime) {
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(subject)
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public Claims extractAllClaims(String token) {
    return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
  }

  public String extractSubject(String token) {
    return extractAllClaims(token).getSubject();
  }

  public Claims extractClaims(String token) {
    return extractAllClaims(token);
  }

  public boolean isTokenExpired(String token) {
    try {
      return extractAllClaims(token).getExpiration().before(new Date());
    } catch (Exception e) {
      return true;
    }
  }
}

