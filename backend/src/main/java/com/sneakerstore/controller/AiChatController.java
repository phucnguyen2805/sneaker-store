package com.sneakerstore.controller;

import com.sneakerstore.dto.AiChatResponse;
import com.sneakerstore.dto.AiChatRequest;
import com.sneakerstore.service.AiChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API chat AI + lưu lịch sử vào hệ thống Chat.
 * POST /api/chat/ai
 */
@RestController
@RequestMapping("/api/chat/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    /**
     * Body:
     * {
     *   "conversationId": null,   // hoặc id conversation AI hiện có
     *   "message": "Nike dưới 3 triệu?"
     * }
     *
     * Response:
     * {
     *   "conversation": { ... },
     *   "userMessage": { ... senderType: USER },
     *   "aiMessage": { ... senderType: AI }
     * }
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AiChatResponse> chat(
            @Valid @RequestBody AiChatRequest request
    ) {
        AiChatResponse response = aiChatService.chatAndSave(
                request.conversationId(),
                request.message()
        );

        return ResponseEntity.ok(response);
    }
}