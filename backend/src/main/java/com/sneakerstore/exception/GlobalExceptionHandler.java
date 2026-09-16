package com.sneakerstore.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        /*
         * =========================================================
         * 1. RESOURCE NOT FOUND - 404
         * =========================================================
         *
         * Ví dụ:
         * GET /api/products/999
         * nhưng Product 999 không tồn tại.
         */
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleResourceNotFound(
                        ResourceNotFoundException exception,
                        HttpServletRequest request) {

                Map<String, Object> body = new HashMap<>();

                body.put("timestamp", LocalDateTime.now());
                body.put("status", HttpStatus.NOT_FOUND.value());
                body.put("error", HttpStatus.NOT_FOUND.getReasonPhrase());
                body.put("message", exception.getMessage());
                body.put("path", request.getRequestURI());

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(body);
        }

        /*
         * =========================================================
         * 2. VALIDATION ERROR - 400
         * =========================================================
         *
         * Xử lý các lỗi:
         *
         * @NotBlank
         * 
         * @Email
         * 
         * @Size
         * ...
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidationException(
                        MethodArgumentNotValidException exception,
                        HttpServletRequest request) {

                Map<String, String> validationErrors = new HashMap<>();

                exception.getBindingResult()
                                .getFieldErrors()
                                .forEach(error -> validationErrors.put(
                                                error.getField(),
                                                error.getDefaultMessage()));

                Map<String, Object> body = new HashMap<>();

                body.put("timestamp", LocalDateTime.now());
                body.put("status", HttpStatus.BAD_REQUEST.value());
                body.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase());
                body.put("message", "Dữ liệu không hợp lệ");
                body.put("errors", validationErrors);
                body.put("path", request.getRequestURI());

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(body);
        }

        /*
         * =========================================================
         * 3. AUTHENTICATION ERROR - 401
         * =========================================================
         *
         * Ví dụ:
         *
         * POST /api/auth/login
         *
         * email đúng
         * password sai
         *
         * hoặc các AuthenticationException khác.
         *
         * AuthenticationException là class cha của
         * BadCredentialsException.
         */
        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<Map<String, Object>> handleAuthenticationException(
                        AuthenticationException exception,
                        HttpServletRequest request) {

                Map<String, Object> body = new HashMap<>();

                body.put("timestamp", LocalDateTime.now());
                body.put("status", HttpStatus.UNAUTHORIZED.value());
                body.put("error", HttpStatus.UNAUTHORIZED.getReasonPhrase());
                body.put(
                                "message",
                                "Email hoặc mật khẩu không chính xác");
                body.put("path", request.getRequestURI());

                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(body);
        }

        /*
         * =========================================================
         * 4. AUTHORIZATION ERROR - 403
         * =========================================================
         *
         * Người dùng đã đăng nhập nhưng không có quyền.
         *
         * Ví dụ:
         *
         * USER
         * ↓
         * 
         * @PreAuthorize("hasRole('ADMIN')")
         * ↓
         * 403
         */
        @ExceptionHandler(AuthorizationDeniedException.class)
        public ResponseEntity<Map<String, Object>> handleAuthorizationDenied(
                        AuthorizationDeniedException exception,
                        HttpServletRequest request) {

                Map<String, Object> body = new HashMap<>();

                body.put("timestamp", LocalDateTime.now());
                body.put("status", HttpStatus.FORBIDDEN.value());
                body.put("error", HttpStatus.FORBIDDEN.getReasonPhrase());
                body.put(
                                "message",
                                "Bạn không có quyền truy cập tài nguyên này");
                body.put("path", request.getRequestURI());

                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(body);
        }

        /*
         * =========================================================
         * 5. OTHER RUNTIME EXCEPTION - 500
         * =========================================================
         */
        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<Map<String, Object>> handleRuntimeException(
                        RuntimeException exception,
                        HttpServletRequest request) {

                Map<String, Object> body = new HashMap<>();

                body.put("timestamp", LocalDateTime.now());
                body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
                body.put(
                                "error",
                                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
                body.put("message", exception.getMessage());
                body.put("path", request.getRequestURI());

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(body);
        }

        /*
         * =========================================================
         * 6. OTHER UNKNOWN EXCEPTION - 500
         * =========================================================
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGeneralException(
                        Exception exception,
                        HttpServletRequest request) {

                Map<String, Object> body = new HashMap<>();

                body.put("timestamp", LocalDateTime.now());
                body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
                body.put(
                                "error",
                                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
                body.put(
                                "message",
                                "Đã xảy ra lỗi không xác định");
                body.put("path", request.getRequestURI());

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(body);
        }
}