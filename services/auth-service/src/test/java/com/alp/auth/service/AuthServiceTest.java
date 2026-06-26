package com.alp.auth.service;

import com.alp.auth.dto.AuthResponse;
import com.alp.auth.dto.LoginRequest;
import com.alp.auth.dto.RegisterRequest;
import com.alp.auth.exception.AppException;
import com.alp.auth.model.Role;
import com.alp.auth.model.User;
import com.alp.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFirstName("Jane");
        registerRequest.setLastName("Doe");
        registerRequest.setEmail("jane@example.com");
        registerRequest.setPassword("securepass123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("jane@example.com");
        loginRequest.setPassword("securepass123");

        testUser = User.builder()
                .id(UUID.randomUUID())
                .firstName("Jane")
                .lastName("Doe")
                .email("jane@example.com")
                .passwordHash("hashed_password")
                .role(Role.FREE)
                .build();
    }

    @Test
    @DisplayName("register() creates a new FREE user and returns auth response")
    void register_createsUser_returnsAuthResponse() {
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("securepass123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("mock.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("jane@example.com");
        assertThat(response.getUser().getRole()).isEqualTo(Role.FREE);
        assertThat(response.getTokens().getAccessToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getTokens().getTokenType()).isEqualTo("Bearer");

        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register() throws CONFLICT when email already exists")
    void register_throwsConflict_whenEmailExists() {
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(AppException.class)
                .satisfies(ex -> {
                    assertThat(((AppException) ex).getStatus()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login() returns auth response for valid credentials")
    void login_returnsAuthResponse_forValidCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(testUser, null, testUser.getAuthorities()));
        when(jwtService.generateToken(testUser)).thenReturn("mock.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("jane@example.com");
        assertThat(response.getTokens().getAccessToken()).isEqualTo("mock.jwt.token");
    }

    @Test
    @DisplayName("login() propagates BadCredentialsException for invalid credentials")
    void login_throwsBadCredentials_forInvalidCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }
}
