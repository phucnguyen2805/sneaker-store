package com.sneakerstore.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    /*
     * Method này được Spring Security gọi khi request
     * cần authentication nhưng người dùng:
     *
     * - chưa đăng nhập
     * - không gửi JWT
     * - JWT không hợp lệ
     * - JWT đã hết hạn
     *
     * Ta trả HTTP 401 Unauthorized.
     */
    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        response.sendError(
                HttpServletResponse.SC_UNAUTHORIZED,
                "Unauthorized");
    }
}