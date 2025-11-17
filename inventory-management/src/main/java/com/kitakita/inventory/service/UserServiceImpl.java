package com.kitakita.inventory.service;

import com.kitakita.inventory.dto.request.LoginRequest;
import com.kitakita.inventory.dto.request.SignupRequest;
import com.kitakita.inventory.dto.response.AuthResponse;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.exception.EmailAlreadyExistsException;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.UserRepository;
import com.kitakita.inventory.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse registerUser(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered: " + signupRequest.getEmail());
        }

        // Create new user
        User user = User.builder()
                .email(signupRequest.getEmail())
                .passwordHash(passwordEncoder.encode(signupRequest.getPassword()))
                .fullName(signupRequest.getFullName())
                .isActive(true)
                .role("ROLE_USER")
                .build();

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(savedUser.getUserId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .createdAt(savedUser.getCreatedAt())
                .lastLogin(savedUser.getLastLogin())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse loginUser(LoginRequest loginRequest) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String token = tokenProvider.generateToken(authentication);

        // Get user details
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    @Override
    @Transactional
    public void updateLastLogin(String email) {
        User user = getUserByEmail(email);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }
}
