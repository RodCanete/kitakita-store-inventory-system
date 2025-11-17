package com.kitakita.inventory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Integer userId;
    private String email;
    private String fullName;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
