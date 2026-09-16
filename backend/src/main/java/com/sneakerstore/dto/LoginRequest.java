package com.sneakerstore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {

    /*
     * Email dùng để đăng nhập.
     */
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    /*
     * Mật khẩu người dùng nhập.
     */
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}