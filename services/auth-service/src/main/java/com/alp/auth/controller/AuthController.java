package com.alp.auth.controller;

import com.alp.auth.dto.AuthResponse;
import com.alp.auth.dto.LoginRequest;
import com.alp.auth.dto.RegisterRequest;
import com.alp.auth.dto.UserDto;
import com.alp.auth.model.User;
import com.alp.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account.
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate and receive a JWT.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Get the currently authenticated user's profile.
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserDto.from(user));
    }

    /**
     * Logout — client should discard the token.
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless; the client discards the token.
        // Future: add token blocklist for hard invalidation.
        return ResponseEntity.noContent().build();
    }

    /**
     * Health check used by other services to validate tokens.
     * GET /api/auth/validate
     */
    @GetMapping("/validate")
    public ResponseEntity<UserDto> validate(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserDto.from(user));
    }
}
