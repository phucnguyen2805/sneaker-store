package com.sneakerstore.exception;

/**
 * Exception dùng khi Client cố tạo một tài nguyên
 * đã tồn tại trong hệ thống.
 *
 * Ví dụ:
 * Product + Size + Color đã tồn tại
 * nhưng Client gửi request tạo lại.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}