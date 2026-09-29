package com.sneakerstore.service;

import com.sneakerstore.dto.ChatConversationResponse;
import com.sneakerstore.dto.ChatMessageResponse;
import com.sneakerstore.dto.CreateChatConversationRequest;
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

@Service
public class ChatService {

    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatService(
            ChatConversationRepository chatConversationRepository,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository) {

        this.chatConversationRepository = chatConversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    /**
     * Tạo conversation mới cho User hiện tại.
     *
     * User được xác định từ JWT -> email -> User trong database.
     */
    @Transactional
    public ChatConversationResponse createConversation(
            CreateChatConversationRequest request) {

        User currentUser = getCurrentUser();

        ChatConversationType type = request.getType();

        /*
         * Với mỗi loại chat, chỉ giữ một conversation OPEN
         * cho một user.
         */
        return chatConversationRepository
                .findFirstByCustomerIdAndTypeAndStatusOrderByLastMessageAtDesc(
                        currentUser.getId(),
                        type,
                        ChatConversationStatus.OPEN)
                .map(this::toConversationResponse)
                .orElseGet(() -> {

                    LocalDateTime now = LocalDateTime.now();

                    ChatConversation conversation = ChatConversation.builder()
                            .customerId(currentUser.getId())
                            .type(type)
                            .status(ChatConversationStatus.OPEN)
                            .assignedAdminId(null)
                            .createdAt(now)
                            .updatedAt(now)
                            .lastMessageAt(null)
                            .build();

                    ChatConversation saved =
                            chatConversationRepository.save(conversation);

                    return toConversationResponse(saved);
                });
    }

    /**
     * Lấy toàn bộ conversation của User hiện tại.
     */
    public List<ChatConversationResponse> getMyConversations() {

        User currentUser = getCurrentUser();

        return chatConversationRepository
                .findByCustomerIdOrderByLastMessageAtDesc(currentUser.getId())
                .stream()
                .map(this::toConversationResponse)
                .toList();
    }

    /**
     * Lấy một conversation.
     *
     * User chỉ được xem conversation thuộc chính mình.
     */
    public ChatConversationResponse getMyConversation(Long conversationId) {

        User currentUser = getCurrentUser();

        ChatConversation conversation =
                getOwnedConversation(
                        conversationId,
                        currentUser.getId());

        return toConversationResponse(conversation);
    }

    /**
     * Lấy toàn bộ message của conversation.
     */
    public List<ChatMessageResponse> getMessages(Long conversationId) {

        User currentUser = getCurrentUser();

        getOwnedConversation(
                conversationId,
                currentUser.getId());

        return chatMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    /**
     * User gửi message.
     *
     * Message có senderType = USER.
     *
     * Quan trọng:
     * isRead = false
     * vì lúc User vừa gửi thì Admin CHƯA đọc.
     */
    @Transactional
    public ChatMessageResponse sendMessage(
            Long conversationId,
            SendChatMessageRequest request) {

        User currentUser = getCurrentUser();

        ChatConversation conversation =
                getOwnedConversation(
                        conversationId,
                        currentUser.getId());

        if (conversation.getStatus() == ChatConversationStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Conversation đã được đóng");
        }

        String content = request.getContent();

        if (content == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nội dung tin nhắn không hợp lệ");
        }

        /*
         * Trim ở backend để tránh lưu khoảng trắng thừa.
         */
        content = content.trim();

        if (content.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nội dung tin nhắn không hợp lệ");
        }

        LocalDateTime now = LocalDateTime.now();

        ChatMessage message = ChatMessage.builder()
                .conversationId(conversation.getId())
                .senderType(ChatSenderType.USER)
                .senderId(currentUser.getId())
                .content(content)
                .isRead(false)
                .createdAt(now)
                .build();

        ChatMessage savedMessage =
                chatMessageRepository.save(message);

        /*
         * Cập nhật thời gian conversation để Admin
         * biết conversation vừa có message mới.
         */
        conversation.setLastMessageAt(now);
        conversation.setUpdatedAt(now);

        chatConversationRepository.save(conversation);

        return toMessageResponse(savedMessage);
    }

    /**
     * Đóng conversation của User hiện tại.
     */
    @Transactional
    public ChatConversationResponse closeConversation(Long conversationId) {

        User currentUser = getCurrentUser();

        ChatConversation conversation =
                getOwnedConversation(
                        conversationId,
                        currentUser.getId());

        conversation.setStatus(ChatConversationStatus.CLOSED);

        ChatConversation saved =
                chatConversationRepository.save(conversation);

        return toConversationResponse(saved);
    }

    /**
     * Lấy User hiện tại từ Spring Security.
     *
     * Current project:
     * username = email
     */
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập");
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Không xác định được tài khoản hiện tại");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Không tìm thấy tài khoản hiện tại"));
    }

    /**
     * Lấy conversation và kiểm tra quyền sở hữu.
     */
    private ChatConversation getOwnedConversation(
            Long conversationId,
            Long customerId) {

        return chatConversationRepository
                .findByIdAndCustomerId(
                        conversationId,
                        customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy conversation"));
    }

    private ChatConversationResponse toConversationResponse(
            ChatConversation conversation) {

        return new ChatConversationResponse(
                conversation.getId(),
                conversation.getCustomerId(),
                conversation.getType(),
                conversation.getStatus(),
                conversation.getAssignedAdminId(),
                conversation.getCreatedAt(),
                conversation.getUpdatedAt(),
                conversation.getLastMessageAt()
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
     * Lấy conversation AI OPEN của user hiện tại.
     * - Nếu conversationId != null: kiểm tra ownership + type = AI + OPEN
     * - Nếu null: tìm OPEN AI hiện có, không có thì tạo mới
     */
    @Transactional
    public ChatConversationResponse getOrCreateAiConversation(Long conversationId) {
        User currentUser = getCurrentUser();

        if (conversationId != null) {
            ChatConversation conversation = getOwnedConversation(
                    conversationId,
                    currentUser.getId()
            );

            if (conversation.getType() != ChatConversationType.AI) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Conversation này không phải loại AI"
                );
            }

            if (conversation.getStatus() == ChatConversationStatus.CLOSED) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Conversation AI đã được đóng. Hãy tạo conversation mới."
                );
            }

            return toConversationResponse(conversation);
        }

        // Giống createConversation(type=AI): chỉ giữ 1 OPEN AI / user
        return chatConversationRepository
                .findFirstByCustomerIdAndTypeAndStatusOrderByLastMessageAtDesc(
                        currentUser.getId(),
                        ChatConversationType.AI,
                        ChatConversationStatus.OPEN)
                .map(this::toConversationResponse)
                .orElseGet(() -> {
                    LocalDateTime now = LocalDateTime.now();

                    ChatConversation conversation = ChatConversation.builder()
                            .customerId(currentUser.getId())
                            .type(ChatConversationType.AI)
                            .status(ChatConversationStatus.OPEN)
                            .assignedAdminId(null)
                            .createdAt(now)
                            .updatedAt(now)
                            .lastMessageAt(null)
                            .build();

                    return toConversationResponse(
                            chatConversationRepository.save(conversation)
                    );
                });
    }

    /**
     * Lưu 1 message vào conversation (USER hoặc AI).
     * Cập nhật lastMessageAt của conversation.
     */
    @Transactional
    public ChatMessageResponse appendMessage(
            Long conversationId,
            ChatSenderType senderType,
            Long senderId,
            String content
    ) {
        User currentUser = getCurrentUser();

        ChatConversation conversation = getOwnedConversation(
                conversationId,
                currentUser.getId()
        );

        if (conversation.getStatus() == ChatConversationStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Conversation đã được đóng"
            );
        }

        if (content == null || content.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nội dung tin nhắn không hợp lệ"
            );
        }

        String trimmed = content.trim();
        LocalDateTime now = LocalDateTime.now();

        ChatMessage message = ChatMessage.builder()
                .conversationId(conversation.getId())
                .senderType(senderType)
                .senderId(senderId)
                .content(trimmed)
                // AI message: user đã "đọc" ngay; USER message: đánh dấu chưa đọc (đối với admin nếu là SHOP)
                .isRead(senderType == ChatSenderType.AI)
                .createdAt(now)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        conversation.setLastMessageAt(now);
        conversation.setUpdatedAt(now);
        chatConversationRepository.save(conversation);

        return toMessageResponse(saved);
    }
}