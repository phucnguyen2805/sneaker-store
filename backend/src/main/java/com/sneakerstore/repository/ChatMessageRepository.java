package com.sneakerstore.repository;

import com.sneakerstore.entity.ChatMessage;
import com.sneakerstore.entity.ChatSenderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(
            Long conversationId
    );

    List<ChatMessage> findByConversationIdAndSenderTypeOrderByCreatedAtAsc(
            Long conversationId,
            ChatSenderType senderType
    );

    long countByConversationIdAndIsReadFalse(
            Long conversationId
    );

    long countByConversationIdAndSenderTypeAndIsReadFalse(
            Long conversationId,
            ChatSenderType senderType
    );

    @Modifying
    @Query("""
            UPDATE ChatMessage m
            SET m.isRead = true
            WHERE m.conversationId = :conversationId
              AND m.senderType = :senderType
              AND m.isRead = false
            """)
    int markMessagesAsRead(
            @Param("conversationId") Long conversationId,
            @Param("senderType") ChatSenderType senderType
    );
        /**
     * Lấy message gần nhất của conversation, mới nhất trước.
     * Service sẽ reverse lại thành cũ → mới khi gửi Gemini.
     */
    List<ChatMessage> findTop20ByConversationIdOrderByCreatedAtDesc(
            Long conversationId
    );
}