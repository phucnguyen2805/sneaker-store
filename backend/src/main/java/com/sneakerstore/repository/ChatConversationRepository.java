package com.sneakerstore.repository;

import com.sneakerstore.entity.ChatConversation;
import com.sneakerstore.entity.ChatConversationStatus;
import com.sneakerstore.entity.ChatConversationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository
        extends JpaRepository<ChatConversation, Long> {

    List<ChatConversation> findByCustomerIdOrderByLastMessageAtDesc(
            Long customerId
    );

    List<ChatConversation> findByCustomerIdAndTypeOrderByLastMessageAtDesc(
            Long customerId,
            ChatConversationType type
    );

    Optional<ChatConversation> findByIdAndCustomerId(
            Long id,
            Long customerId
    );

    Optional<ChatConversation>
    findFirstByCustomerIdAndTypeAndStatusOrderByLastMessageAtDesc(
            Long customerId,
            ChatConversationType type,
            ChatConversationStatus status
    );

    List<ChatConversation> findByAssignedAdminIdOrderByLastMessageAtDesc(
            Long assignedAdminId
    );

    List<ChatConversation> findByStatusOrderByLastMessageAtDesc(
            ChatConversationStatus status
    );

    List<ChatConversation> findByTypeOrderByLastMessageAtDesc(
            ChatConversationType type
    );
}