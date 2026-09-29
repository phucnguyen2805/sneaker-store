package com.sneakerstore.dto;

import com.sneakerstore.entity.ChatConversationStatus;
import com.sneakerstore.entity.ChatConversationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminChatConversationResponse {

    private Long id;

    private Long customerId;

    private String customerName;

    private String customerEmail;

    private ChatConversationType type;

    private ChatConversationStatus status;

    private Long assignedAdminId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastMessageAt;

    private long unreadCount;
}