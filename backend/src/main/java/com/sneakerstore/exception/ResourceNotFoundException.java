package com.sneakerstore.exception;

/**
 * Exception dùng khi không tìm thấy tài nguyên yêu cầu.
 *
 * Ví dụ:
 * - Không tìm thấy Product theo ID
 * - Không tìm thấy Brand theo ID
 * - Không tìm thấy User theo ID
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}