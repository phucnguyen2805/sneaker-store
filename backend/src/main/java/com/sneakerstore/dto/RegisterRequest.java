package com.sneakerstore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    /*
     * Họ tên người dùng.
     */
    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String fullName;

    /*
     * Email dùng để đăng nhập.
     */
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 150, message = "Email không được vượt quá 150 ký tự")
    private String email;

    /*
     * Mật khẩu người dùng nhập khi đăng ký.
     *
     * Password plaintext chỉ tồn tại trong request.
     * Sau đó Service sẽ mã hóa bằng BCrypt
     * trước khi lưu vào database.
     */
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6 đến 100 ký tự")
    private String password;
}