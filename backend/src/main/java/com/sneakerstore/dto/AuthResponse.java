package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    /*
     * JWT Access Token.
     */
    private String token;

    /*
     * ID tài khoản.
     */
    private Long userId;

    /*
     * Họ tên hiển thị trên Frontend.
     */
    private String fullName;

    /*
     * Email tài khoản.
     */
    private String email;

    /*
     * Role của tài khoản.
     *
     * Ví dụ:
     * USER
     * ADMIN
     */
    private String role;
}