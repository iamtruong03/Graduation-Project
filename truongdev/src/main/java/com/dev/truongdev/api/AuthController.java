package com.dev.truongdev.api;

import com.dev.truongdev.config.MyWebSocketHandler;
import com.dev.truongdev.payload.request.AuthRequest;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.utils.JwtTokenUtil;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenUtil jwtTokenUtil;
    private final IUserService userService;
    private final MyWebSocketHandler myWebSocketHandler;

    @PostMapping("/check-actived")
    public ResponseEntity<ApiResponse<String>> checkUserActive(@RequestBody AuthRequest authRequest) {
        try {
            User user = userService.confirmLogin(authRequest.getCode(), authRequest.getPassword());
            return ApiResponse.ok(AppConstants.getStatusName(user.getStatus()));

        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> createAuthenticationToken(
        @RequestBody AuthRequest authRequest) {
        try {
            User user = userService.confirmLogin(authRequest.getCode(), authRequest.getPassword());
            Map<String, Object> claims = new HashMap<>();
            claims.put("did", user.getDepartmentId());
            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken",
                jwtTokenUtil.generateToken(user.getId().toString(), claims, 1000 * 60 * 60)); // 1h
            tokens.put("refreshToken", jwtTokenUtil.generateToken(user.getId().toString(), claims,
                1000 * 60 * 60 * 24 * 10)); // 10d
            return ApiResponse.ok(tokens);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshAuthenticationToken(@RequestBody AuthRequest authRequest) {
        try {
            String userId = jwtTokenUtil.extractSubject(authRequest.getRefreshToken());
            if (userId == null || jwtTokenUtil.isTokenExpired(authRequest.getRefreshToken())) {
                return ApiResponse.error("Invalid refresh token");
            }
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", jwtTokenUtil.generateToken(userId, jwtTokenUtil.extractClaims(authRequest.getRefreshToken()), 1000 * 60 * 60)); // 1h
            response.put("refreshToken", jwtTokenUtil.generateToken(userId, jwtTokenUtil.extractClaims(authRequest.getRefreshToken()), 1000 * 60 * 60 * 24 * 10)); // 10d

            myWebSocketHandler.updateTokenByUser(userId, response.get("accessToken"));
            return ApiResponse.ok(response);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}