package com.sneakerstore.dto;

import com.sneakerstore.entity.ChatSenderType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private Long id;

    private Long conversationId;

    private ChatSenderType senderType;

    private Long senderId;

    private String content;

    private Boolean isRead;

    private LocalDateTime createdAt;
}