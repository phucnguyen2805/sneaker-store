package com.sneakerstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * conversationId:
 * - null  → backend tự lấy/tạo conversation AI OPEN của user
 * - có id → dùng conversation đó (phải thuộc user + type AI)
 */
public record AiChatRequest(
        Long conversationId,

        @NotBlank(message = "Tin nhắn AI không được để trống.")
        @Size(max = 2000, message = "Tin nhắn AI không được vượt quá 2000 ký tự.")
        String message
) {
}