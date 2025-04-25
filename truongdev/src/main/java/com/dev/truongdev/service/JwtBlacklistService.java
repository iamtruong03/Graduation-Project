package com.dev.truongdev.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Date;

@Service
public class JwtBlacklistService {
    private final ConcurrentHashMap<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    public void addToBlacklist(String token, Date expirationDate) {
        blacklistedTokens.put(token, expirationDate);
    }

    public boolean isBlacklisted(String token) {
        Date expirationDate = blacklistedTokens.get(token);
        if (expirationDate == null) {
            return false;
        }
        
        // Nếu token đã hết hạn, xóa khỏi blacklist
        if (expirationDate.before(new Date())) {
            blacklistedTokens.remove(token);
            return false;
        }
        return true;
    }

    public void cleanupExpiredTokens() {
        Date now = new Date();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
}