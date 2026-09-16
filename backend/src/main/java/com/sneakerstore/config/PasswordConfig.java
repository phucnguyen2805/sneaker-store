package com.sneakerstore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

    /*
     * Tạo PasswordEncoder dùng chung cho toàn bộ ứng dụng.
     *
     * BCrypt là cơ chế băm mật khẩu một chiều.
     * Chúng ta không lưu mật khẩu người dùng ở dạng plaintext.
     *
     * Khi đăng ký:
     * password người dùng
     * ↓
     * PasswordEncoder
     * ↓
     * chuỗi BCrypt
     * ↓
     * lưu vào database
     *
     * Khi đăng nhập:
     * password người dùng nhập
     * ↓
     * passwordEncoder.matches(...)
     * ↓
     * so sánh với password BCrypt trong database
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}