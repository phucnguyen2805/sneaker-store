package com.sneakerstore.service;

import com.sneakerstore.dto.AdminChatConversationResponse;
import com.sneakerstore.dto.ChatMessageResponse;
import com.sneakerstore.dto.SendChatMessageRequest;
import com.sneakerstore.entity.ChatConversation;
import com.sneakerstore.entity.ChatConversationStatus;
import com.sneakerstore.entity.ChatConversationType;
import com.sneakerstore.entity.ChatMessage;
import com.sneakerstore.entity.ChatSenderType;
import com.sneakerstore.entity.User;
import com.sneakerstore.repository.ChatConversationRepository;
import com.sneakerstore.repository.ChatMessageRepository;
import com.sneakerstore.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AdminChatService {

    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public AdminChatService(
            ChatConversationRepository chatConversationRepository,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository) {

        this.chatConversationRepository = chatConversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lấy toàn bộ conversation SHOP cho Admin.
     */
    public List<AdminChatConversationResponse> getShopConversations() {

        List<ChatConversation> conversations =
                chatConversationRepository
                        .findByTypeOrderByLastMessageAtDesc(
                                ChatConversationType.SHOP
                        );

        if (conversations.isEmpty()) {
            return List.of();
        }

        List<Long> customerIds = conversations.stream()
                .map(ChatConversation::getCustomerId)
                .distinct()
                .toList();

        Map<Long, User> usersById =
                userRepository.findAllById(customerIds)
                        .stream()
                        .collect(Collectors.toMap(
                                User::getId,
                                Function.identity()
                        ));

        return conversations.stream()
                .map(conversation -> {

                    User customer =
                            usersById.get(
                                    conversation.getCustomerId()
                            );

                    long unreadCount =
                            chatMessageRepository
                                    .countByConversationIdAndSenderTypeAndIsReadFalse(
                                            conversation.getId(),
                                            ChatSenderType.USER
                                    );

                    return new AdminChatConversationResponse(
                            conversation.getId(),
                            conversation.getCustomerId(),
                            customer != null
                                    ? customer.getFullName()
                                    : "Unknown User",
                            customer != null
                                    ? customer.getEmail()
                                    : "",
                            conversation.getType(),
                            conversation.getStatus(),
                            conversation.getAssignedAdminId(),
                            conversation.getCreatedAt(),
                            conversation.getUpdatedAt(),
                            conversation.getLastMessageAt(),
                            unreadCount
                    );
                })
                .toList();
    }

    /**
     * Lấy messages của một SHOP conversation.
     *
     * Khi Admin mở conversation,
     * toàn bộ USER message chưa đọc được đánh dấu đã đọc.
     */
    @Transactional
    public List<ChatMessageResponse> getMessages(
            Long conversationId) {

        getShopConversation(conversationId);

        chatMessageRepository.markMessagesAsRead(
                conversationId,
                ChatSenderType.USER
        );

        return chatMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(
                        conversationId
                )
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    /**
     * Admin gửi message cho khách hàng.
     */
    @Transactional
    public ChatMessageResponse sendMessage(
            Long conversationId,
            SendChatMessageRequest request) {

        User currentAdmin = getCurrentAdmin();

        ChatConversation conversation =
                getShopConversation(conversationId);

        if (conversation.getStatus()
                == ChatConversationStatus.CLOSED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Conversation đã được đóng"
            );
        }

        String content =
                request.getContent() == null
                        ? ""
                        : request.getContent().trim();

        if (content.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nội dung tin nhắn không hợp lệ"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        ChatMessage message = ChatMessage.builder()
                .conversationId(conversation.getId())
                .senderType(ChatSenderType.ADMIN)
                .senderId(currentAdmin.getId())
                .content(content)
                /*
                 * false:
                 * khách hàng chưa đọc message này.
                 */
                .isRead(false)
                .createdAt(now)
                .build();

        ChatMessage savedMessage =
                chatMessageRepository.save(message);

        /*
         * Admin đầu tiên trả lời sẽ tự động
         * trở thành admin phụ trách conversation.
         */
        if (conversation.getAssignedAdminId() == null) {
            conversation.setAssignedAdminId(
                    currentAdmin.getId()
            );
        }

        conversation.setLastMessageAt(now);
        conversation.setUpdatedAt(now);

        chatConversationRepository.save(conversation);

        return toMessageResponse(savedMessage);
    }

    /**
     * Admin đóng conversation.
     */
    @Transactional
    public AdminChatConversationResponse closeConversation(
            Long conversationId) {

        ChatConversation conversation =
                getShopConversation(conversationId);

        conversation.setStatus(
                ChatConversationStatus.CLOSED
        );

        ChatConversation saved =
                chatConversationRepository.save(conversation);

        return toAdminConversationResponse(saved);
    }

    /**
     * Admin mở lại conversation đã đóng.
     */
    @Transactional
    public AdminChatConversationResponse reopenConversation(
            Long conversationId) {

        ChatConversation conversation =
                getShopConversation(conversationId);

        conversation.setStatus(
                ChatConversationStatus.OPEN
        );

        ChatConversation saved =
                chatConversationRepository.save(conversation);

        return toAdminConversationResponse(saved);
    }

    /**
     * Lấy conversation và đảm bảo đây là SHOP conversation.
     */
    private ChatConversation getShopConversation(
            Long conversationId) {

        ChatConversation conversation =
                chatConversationRepository
                        .findById(conversationId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Không tìm thấy conversation"
                                )
                        );

        if (conversation.getType()
                != ChatConversationType.SHOP) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Conversation này không thuộc Shop Chat"
            );
        }

        return conversation;
    }

    /**
     * Lấy Admin hiện tại từ JWT.
     *
     * username của project = email.
     */
    private User getCurrentAdmin() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication
                        instanceof AnonymousAuthenticationToken) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập"
            );
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Không tìm thấy tài khoản"
                        )
                );

        if (user.getRole() == null
                || !"ADMIN".equals(
                        user.getRole().name())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền Admin"
            );
        }

        return user;
    }

    private AdminChatConversationResponse
    toAdminConversationResponse(
            ChatConversation conversation) {

        User customer =
                userRepository.findById(
                        conversation.getCustomerId()
                ).orElse(null);

        long unreadCount =
                chatMessageRepository
                        .countByConversationIdAndSenderTypeAndIsReadFalse(
                                conversation.getId(),
                                ChatSenderType.USER
                        );

        return new AdminChatConversationResponse(
                conversation.getId(),
                conversation.getCustomerId(),
                customer != null
                        ? customer.getFullName()
                        : "Unknown User",
                customer != null
                        ? customer.getEmail()
                        : "",
                conversation.getType(),
                conversation.getStatus(),
                conversation.getAssignedAdminId(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt(),
                conversation.getLastMessageAt(),
                unreadCount
        );
    }

    private ChatMessageResponse toMessageResponse(
            ChatMessage message) {

        return new ChatMessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderType(),
                message.getSenderId(),
                message.getContent(),
                message.getIsRead(),
                message.getCreatedAt()
        );
    }

        /**
     * Admin xóa conversation SHOP (và toàn bộ message).
     */
    @Transactional
    public void deleteConversation(Long conversationId) {
        ChatConversation conversation = chatConversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy conversation"
                ));

        if (conversation.getType() != ChatConversationType.SHOP) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Admin chỉ xóa được conversation loại SHOP"
            );
        }

        chatMessageRepository.deleteByConversationId(conversation.getId());
        chatConversationRepository.delete(conversation);
    }
}