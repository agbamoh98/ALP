package com.alp.auth.service;

import com.alp.auth.dto.AuthResponse;
import com.alp.auth.dto.LoginRequest;
import com.alp.auth.dto.RegisterRequest;
import com.alp.auth.dto.UserDto;
import com.alp.auth.exception.AppException;
import com.alp.auth.model.Role;
import com.alp.auth.model.User;
import com.alp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new AppException(
                    "An account with this email already exists.",
                    HttpStatus.CONFLICT
            );
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.FREE)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = (User) auth.getPrincipal();
        log.info("User logged in: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        Map<String, Object> extraClaims = Map.of(
                "userId", user.getId().toString(),
                "role", user.getRole().name()
        );
        String token = jwtService.generateToken(extraClaims, user);

        return AuthResponse.builder()
                .user(UserDto.from(user))
                .tokens(AuthResponse.TokenDto.builder()
                        .accessToken(token)
                        .tokenType("Bearer")
                        .expiresIn(jwtService.getExpirationMs())
                        .build())
                .build();
    }
}
