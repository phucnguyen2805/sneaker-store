package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Response chat AI:
 * - conversation / userMessage / aiMessage: lưu history
 * - products: danh sách sp AI vừa nhắc (để FE render Product Card)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {

    private ChatConversationResponse conversation;

    private ChatMessageResponse userMessage;

    private ChatMessageResponse aiMessage;

    /**
     * Các sản phẩm thật AI đề cập trong câu trả lời (đã lọc theo DB).
     * Có thể rỗng nếu AI không nhắc productId hoặc id không tồn tại.
     */
    private List<ProductChatSnippet> products = new ArrayList<>();
}