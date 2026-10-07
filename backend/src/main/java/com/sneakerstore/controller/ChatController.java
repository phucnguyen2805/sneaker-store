package com.sneakerstore.controller;

import com.sneakerstore.dto.ChatConversationResponse;
import com.sneakerstore.dto.ChatMessageResponse;
import com.sneakerstore.dto.CreateChatConversationRequest;
import com.sneakerstore.dto.SendChatMessageRequest;
import com.sneakerstore.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@PreAuthorize("isAuthenticated()")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Tạo conversation mới hoặc lấy conversation OPEN
     * hiện tại của User theo type.
     *
     * POST /api/chat/conversations
     *
     * Body:
     * {
     *     "type": "SHOP"
     * }
     */
    @PostMapping("/conversations")
    public ResponseEntity<ChatConversationResponse> createConversation(
            @Valid @RequestBody CreateChatConversationRequest request) {

        ChatConversationResponse response =
                chatService.createConversation(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Lấy toàn bộ conversation của User hiện tại.
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationResponse>>
    getMyConversations() {

        return ResponseEntity.ok(
                chatService.getMyConversations()
        );
    }

    /**
     * Lấy một conversation của User hiện tại.
     */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ChatConversationResponse>
    getMyConversation(
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                chatService.getMyConversation(conversationId)
        );
    }

    /**
     * Lấy message của conversation.
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageResponse>>
    getMessages(
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                chatService.getMessages(conversationId)
        );
    }

    /**
     * User gửi message.
     */
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ChatMessageResponse>
    sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendChatMessageRequest request) {

        ChatMessageResponse response =
                chatService.sendMessage(
                        conversationId,
                        request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * User đóng conversation.
     */
    @PutMapping("/conversations/{conversationId}/close")
    public ResponseEntity<ChatConversationResponse>
    closeConversation(
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                chatService.closeConversation(conversationId)
        );
    }

        /**
     * User xóa conversation (SHOP hoặc AI) của chính mình.
     * DELETE /api/chat/conversations/{conversationId}
     */
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId) {

        chatService.deleteMyConversation(conversationId);

        return ResponseEntity.noContent().build();
    }
}