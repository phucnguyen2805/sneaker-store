package com.sneakerstore.controller;

import com.sneakerstore.dto.AuthResponse;
import com.sneakerstore.dto.LoginRequest;
import com.sneakerstore.dto.RegisterRequest;
import com.sneakerstore.entity.User;
import com.sneakerstore.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /*
     * =========================================================
     * REGISTER
     * =========================================================
     *
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        /*
         * Register chưa tạo JWT.
         * User sẽ Login để nhận token.
         */
        AuthResponse response = new AuthResponse(
                null,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * =========================================================
     * LOGIN
     * =========================================================
     *
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
}