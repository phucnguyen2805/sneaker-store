package com.sneakerstore.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public JwtAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /*
     * Method này được Spring Security gọi khi:
     *
     * - User đã đăng nhập
     * - JWT hợp lệ
     * - Nhưng User không có quyền truy cập tài nguyên
     *
     * Ví dụ:
     *
     * USER
     * ↓
     * GET /api/admin/test
     * ↓
     * 403 Forbidden
     */
    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpServletResponse.SC_FORBIDDEN);
        body.put("error", "Forbidden");
        body.put(
                "message",
                "Bạn không có quyền truy cập tài nguyên này");
        body.put("path", request.getRequestURI());

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");

        /*
         * Jackson 3 sử dụng tools.jackson.databind.ObjectMapper.
         */
        response.getWriter().write(
                objectMapper.writeValueAsString(body));
    }
}