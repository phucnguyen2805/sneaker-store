package com.sneakerstore.controller;

import com.sneakerstore.dto.AdminChatConversationResponse;
import com.sneakerstore.dto.ChatMessageResponse;
import com.sneakerstore.dto.SendChatMessageRequest;
import com.sneakerstore.service.AdminChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/chat")
@PreAuthorize("hasRole('ADMIN')")
public class AdminChatController {

    private final AdminChatService adminChatService;

    public AdminChatController(
            AdminChatService adminChatService) {

        this.adminChatService = adminChatService;
    }

    /**
     * Lấy danh sách tất cả SHOP conversations.
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<AdminChatConversationResponse>>
    getConversations() {

        return ResponseEntity.ok(
                adminChatService.getShopConversations()
        );
    }

    /**
     * Lấy messages của một conversation.
     *
     * Đồng thời đánh dấu USER messages chưa đọc
     * thành đã đọc.
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageResponse>>
    getMessages(
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                adminChatService.getMessages(
                        conversationId
                )
        );
    }

    /**
     * Admin gửi message.
     */
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ChatMessageResponse>
    sendMessage(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendChatMessageRequest request) {

        ChatMessageResponse response =
                adminChatService.sendMessage(
                        conversationId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Đóng conversation.
     */
    @PutMapping("/conversations/{conversationId}/close")
    public ResponseEntity<AdminChatConversationResponse>
    closeConversation(
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                adminChatService.closeConversation(
                        conversationId
                )
        );
    }

    /**
     * Mở lại conversation.
     */
    @PutMapping("/conversations/{conversationId}/reopen")
    public ResponseEntity<AdminChatConversationResponse>
    reopenConversation(
            @PathVariable Long conversationId) {

        return ResponseEntity.ok(
                adminChatService.reopenConversation(
                        conversationId
                )
        );
    }

        /**
     * Admin xóa conversation SHOP.
     * DELETE /api/admin/chat/conversations/{conversationId}
     */
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId) {

        adminChatService.deleteConversation(conversationId);

        return ResponseEntity.noContent().build();
    }
}