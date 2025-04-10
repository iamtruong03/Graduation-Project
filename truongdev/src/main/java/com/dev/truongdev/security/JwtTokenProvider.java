package com.dev.truongdev.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private SecretKey SECRET_KEY;

    @Value("${app.jwt.expiration}")
    private long expirationTime;

    @PostConstruct
    public void init() {
        this.SECRET_KEY = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
            .setSubject(authentication.getName())
            .claim("role", authentication.getAuthorities())
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SECRET_KEY)
            .compact();
    }

    private SecretKey getSigningKey() {
        return SECRET_KEY;
    }

    private static final Set<String> tokenBlacklist = new HashSet<>();

    public void invalidateToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
            
            // Thêm token vào danh sách đen
            tokenBlacklist.add(token);
            
            // Đặt thời gian hết hạn ngay lập tức
            claims.setExpiration(new Date());
        } catch (Exception ex) {
            // Token đã không hợp lệ
        }
    }

    public boolean validateToken(String token) {
        // Kiểm tra xem token có trong danh sách đen không
        if (tokenBlacklist.contains(token)) {
            return false;
        }
        
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();

        String username = claims.getSubject();
        List<?> roles = claims.get("role", List.class);
        List<String> authorities = roles.stream()
            .map(Object::toString)
            .collect(Collectors.toList());
            
        List<GrantedAuthority> grantedAuthorities = authorities.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(username, null, grantedAuthorities);
    }
}