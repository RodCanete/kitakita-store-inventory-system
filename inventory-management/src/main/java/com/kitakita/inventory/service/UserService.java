package com.kitakita.inventory.service;

import com.kitakita.inventory.dto.request.LoginRequest;
import com.kitakita.inventory.dto.request.SignupRequest;
import com.kitakita.inventory.dto.response.AuthResponse;
import com.kitakita.inventory.entity.User;

public interface UserService {
    AuthResponse registerUser(SignupRequest signupRequest);
    AuthResponse loginUser(LoginRequest loginRequest);
    User getUserByEmail(String email);
    User getUserById(Integer userId);
    void updateLastLogin(String email);
}
