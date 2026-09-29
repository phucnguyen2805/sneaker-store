package com.sneakerstore.service;

import com.sneakerstore.config.GeminiConfig;
import com.sneakerstore.entity.Product;
import com.sneakerstore.entity.ProductVariant;
import com.sneakerstore.repository.ProductRepository;
import com.sneakerstore.repository.ProductVariantRepository;
import tools.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import com.sneakerstore.dto.AiChatResponse;
import com.sneakerstore.dto.ChatConversationResponse;
import com.sneakerstore.dto.ChatMessageResponse;
import com.sneakerstore.entity.ChatSenderType;
import com.sneakerstore.dto.ProductChatSnippet;
import com.sneakerstore.entity.ChatMessage;
import com.sneakerstore.repository.ChatMessageRepository;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Collections;

/**
 * Gọi Gemini + đưa dữ liệu sản phẩm thật từ DB vào context.
 * AI chỉ được trả lời dựa trên catalog này — không được bịa.
 */
@Service
public class AiChatService {

    /** Giới hạn số sản phẩm đưa vào prompt (tránh vượt token). */
    private static final int MAX_PRODUCTS_IN_CONTEXT = 40;
    private static final int MAX_HISTORY_MESSAGES = 12;

        /**
     * Bắt [productId:123] trong câu trả lời AI.
     * Chỉ chấp nhận số nguyên dương.
     */
    private static final Pattern PRODUCT_ID_PATTERN =
            Pattern.compile("\\[productId:(\\d+)\\]", Pattern.CASE_INSENSITIVE);

    private final RestClient restClient;
    private final GeminiConfig geminiConfig;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ChatService chatService;
    private final ChatMessageRepository chatMessageRepository;

    public AiChatService(
            GeminiConfig geminiConfig,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            ChatService chatService,
            ChatMessageRepository chatMessageRepository
            
    ) {
        this.geminiConfig = geminiConfig;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.chatService = chatService;
        this.chatMessageRepository = chatMessageRepository;
        this.restClient = RestClient.builder()
                .baseUrl(geminiConfig.getBaseUrl())
                .build();
    }

         /**
     * Chat AI + lưu history + nhớ ngữ cảnh conversation.
     */
    @Transactional
    public AiChatResponse chatAndSave(Long conversationId, String userMessage) {
        ChatConversationResponse conversation =
                chatService.getOrCreateAiConversation(conversationId);

        Long convId = conversation.getId();
        Long customerId = conversation.getCustomerId();

        // 1. Lấy history TRƯỚC khi lưu tin mới (tránh trùng tin vừa gửi)
        List<ChatMessage> history = loadRecentHistory(convId);

        // 2. Lưu tin USER
        ChatMessageResponse userMsg = chatService.appendMessage(
                convId,
                ChatSenderType.USER,
                customerId,
                userMessage
        );

        // 3. Gọi Gemini kèm history + câu hỏi hiện tại
        String aiText = chatWithHistory(history, userMessage);

        // 4. Lưu tin AI
        ChatMessageResponse aiMsg = chatService.appendMessage(
                convId,
                ChatSenderType.AI,
                null,
                aiText
        );

        List<ProductChatSnippet> products = resolveMentionedProducts(aiText);

        ChatConversationResponse updatedConversation =
                chatService.getOrCreateAiConversation(convId);

        return new AiChatResponse(
                updatedConversation,
                userMsg,
                aiMsg,
                products
        );
    }

        /**
     * Lấy tối đa MAX_HISTORY_MESSAGES tin gần nhất, sắp xếp cũ → mới.
     */
    private List<ChatMessage> loadRecentHistory(Long conversationId) {
        List<ChatMessage> newestFirst =
                chatMessageRepository
                        .findTop20ByConversationIdOrderByCreatedAtDesc(conversationId);

        if (newestFirst.isEmpty()) {
            return List.of();
        }

        // Cắt còn MAX_HISTORY_MESSAGES (đã là mới nhất trước)
        int limit = Math.min(MAX_HISTORY_MESSAGES, newestFirst.size());
        List<ChatMessage> limited = new ArrayList<>(
                newestFirst.subList(0, limit)
        );

        // Đảo thành cũ → mới để đưa vào Gemini
        Collections.reverse(limited);
        return limited;
    }

    /**
     * Gọi Gemini với multi-turn contents (history + câu hỏi mới).
     */
    private String chatWithHistory(List<ChatMessage> history, String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nội dung câu hỏi AI không được để trống."
            );
        }

        if (!geminiConfig.isConfigured()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Gemini API chưa được cấu hình. Hãy set biến môi trường GEMINI_API_KEY."
            );
        }

        String catalogText = buildProductCatalogContext();
        String systemPrompt = buildSystemPrompt(catalogText);

        // contents: history (user/model) + tin user hiện tại
        List<Map<String, Object>> contents = new ArrayList<>();

        for (ChatMessage message : history) {
            String role = toGeminiRole(message.getSenderType());
            if (role == null) {
                continue; // bỏ SYSTEM hoặc type lạ
            }

            String text = message.getContent();
            if (text == null || text.isBlank()) {
                continue;
            }

            contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", text.trim()))
            ));
        }

        // Câu hỏi hiện tại
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userMessage.trim()))
        ));

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", contents,
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", 1536
                )
        );

        String path = "/models/" + geminiConfig.getModel() + ":generateContent";

        try {
            JsonNode response = restClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key", geminiConfig.getApiKey())
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            return extractText(response);

        } catch (RestClientResponseException ex) {
            String detail = ex.getResponseBodyAsString();
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini API lỗi (" + ex.getStatusCode().value() + "): "
                            + (detail != null && !detail.isBlank() ? detail : ex.getMessage())
            );
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Không gọi được Gemini API: " + ex.getMessage()
            );
        }
    }

    /**
     * Map ChatSenderType → role Gemini.
     * Gemini: "user" | "model"
     */
    private String toGeminiRole(ChatSenderType senderType) {
        if (senderType == null) {
            return null;
        }

        return switch (senderType) {
            case USER -> "user";
            case AI -> "model";
            default -> null; // ADMIN / SYSTEM không đưa vào context AI
        };
    }

    /**
     * Chat AI với context sản phẩm thật từ DB.
     * @Transactional(readOnly = true) để load lazy Brand/Category/Variant an toàn.
     */
    @Transactional(readOnly = true)
    public String chat(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nội dung câu hỏi AI không được để trống."
            );
        }

        if (!geminiConfig.isConfigured()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Gemini API chưa được cấu hình. Hãy set biến môi trường GEMINI_API_KEY."
            );
        }

        // 1. Lấy catalog thật từ DB
        String catalogText = buildProductCatalogContext();

        // 2. System prompt = quy tắc + dữ liệu sản phẩm
        String systemPrompt = buildSystemPrompt(catalogText);

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(
                                Map.of("text", systemPrompt)
                        )
                ),
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(
                                        Map.of("text", userMessage.trim())
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", 1536
                )
        );

        String path = "/models/" + geminiConfig.getModel() + ":generateContent";

        try {
            JsonNode response = restClient.post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key", geminiConfig.getApiKey())
                    .body(requestBody)
                    .retrieve()
                    .body(JsonNode.class);

            return extractText(response);

        } catch (RestClientResponseException ex) {
            String detail = ex.getResponseBodyAsString();
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini API lỗi (" + ex.getStatusCode().value() + "): "
                            + (detail != null && !detail.isBlank() ? detail : ex.getMessage())
            );
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Không gọi được Gemini API: " + ex.getMessage()
            );
        }
    }

    /**
     * Build text catalog từ DB để nhét vào system prompt.
     * Format dễ đọc cho model, có productId để phase sau render Product Card.
     */
    private String buildProductCatalogContext() {
        List<Product> products = productRepository.findAllWithBrandAndCategory();

        if (products.isEmpty()) {
            return "Hiện tại cửa hàng chưa có sản phẩm nào trong hệ thống.";
        }

        NumberFormat vnd = NumberFormat.getInstance(Locale.forLanguageTag("vi-VN"));
        StringBuilder sb = new StringBuilder();
        sb.append("Danh sách sản phẩm (tối đa ")
                .append(MAX_PRODUCTS_IN_CONTEXT)
                .append(" sp):\n\n");

        int count = 0;
        for (Product product : products) {
            if (count >= MAX_PRODUCTS_IN_CONTEXT) {
                sb.append("... (còn sản phẩm khác, chỉ liệt kê ")
                        .append(MAX_PRODUCTS_IN_CONTEXT)
                        .append(" sp đầu)\n");
                break;
            }

            List<ProductVariant> variants =
                    productVariantRepository.findByProductId(product.getId());

            sb.append("- productId=").append(product.getId())
                    .append(" | ").append(product.getName())
                    .append(" | Brand: ").append(product.getBrand().getName())
                    .append(" | Category: ").append(product.getCategory().getName())
                    .append(" | Giá cơ bản: ")
                    .append(formatMoney(product.getBasePrice(), vnd))
                    .append("\n");

            if (product.getDescription() != null && !product.getDescription().isBlank()) {
                String shortDesc = product.getDescription().trim();
                if (shortDesc.length() > 120) {
                    shortDesc = shortDesc.substring(0, 120) + "...";
                }
                sb.append("  Mô tả: ").append(shortDesc).append("\n");
            }

            if (variants.isEmpty()) {
                sb.append("  Variant: (chưa có size/màu)\n");
            } else {
                sb.append("  Variant:\n");
                for (ProductVariant v : variants) {
                    sb.append("    • size=").append(v.getSize().getName())
                            .append(", màu=").append(v.getColor().getName())
                            .append(", giá=").append(formatMoney(v.getPrice(), vnd))
                            .append(", tồn=").append(v.getStock())
                            .append(v.getStock() != null && v.getStock() > 0 ? "" : " (HẾT HÀNG)")
                            .append("\n");
                }
            }
            sb.append("\n");
            count++;
        }

        return sb.toString();
    }

    private String formatMoney(BigDecimal amount, NumberFormat vnd) {
        if (amount == null) {
            return "N/A";
        }
        return vnd.format(amount) + " VND";
    }

    /**
     * System prompt: quy tắc + catalog thật.
     * Bắt buộc AI chỉ dùng dữ liệu trong catalog.
     */
    private String buildSystemPrompt(String catalogText) {
        return """
                Bạn là trợ lý AI của Sneaker Store — cửa hàng bán giày sneaker trực tuyến tại Việt Nam.

                Quy tắc bắt buộc:
                1. Luôn trả lời bằng tiếng Việt, ngắn gọn, thân thiện.
                2. CHỈ được dùng thông tin trong mục "DỮ LIỆU SẢN PHẨM THỰC TẾ" bên dưới.
                3. CẤM tự bịa tên sản phẩm, giá, size, màu, tồn kho, khuyến mãi không có trong dữ liệu.
                4. Khi giới thiệu sản phẩm, luôn ghi productId dạng: [productId:123] ngay sau tên sản phẩm.
                5. Nếu khách hỏi giá / size / màu / tồn kho: trả lời đúng theo variant trong dữ liệu.
                6. Nếu không có sản phẩm phù hợp trong dữ liệu: nói rõ không tìm thấy, gợi ý đổi điều kiện (brand, khoảng giá, size).
                7. Câu hỏi ngoài phạm vi shop (chính trị, y tế, code, ...): lịch sự từ chối và mời hỏi về sneaker.
                8. Không bịa chính sách đổi trả / ship nếu chưa có trong dữ liệu — nói khách liên hệ Chat với Shop.
                9. Bạn có thể được cung cấp lịch sử hội thoại trước đó. Hãy trả lời dựa trên ngữ cảnh đó
                    (ví dụ khách đã hỏi size/màu nào). Không yêu cầu khách nhắc lại thông tin vừa nói.

                ===== DỮ LIỆU SẢN PHẨM THỰC TẾ =====
                """ + catalogText + """
                ===== HẾT DỮ LIỆU =====
                """;
    }

    private String extractText(JsonNode response) {
        if (response == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini không trả về response."
            );
        }

        JsonNode textNode = response
                .path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text");

        if (!textNode.isTextual()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini không trả về nội dung text hợp lệ. Response: " + response
            );
        }

        String content = textNode.asText().trim();
        if (content.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini trả về nội dung rỗng."
            );
        }
        return content;
    }

        /**
     * Lấy các productId AI nhắc trong text, map sang snippet từ DB.
     * Id không tồn tại / trùng → bỏ hoặc gộp (giữ thứ tự xuất hiện).
     */
       private List<ProductChatSnippet> resolveMentionedProducts(String aiText) {
        List<Long> ids = extractProductIds(aiText);
        if (ids.isEmpty()) {
            return List.of();
        }

        List<Product> found = productRepository.findByIdInWithBrandAndCategory(ids);

        // Giữ đúng thứ tự id AI nhắc
        java.util.Map<Long, Product> byId = new java.util.HashMap<>();
        for (Product p : found) {
            byId.put(p.getId(), p);
        }

        List<ProductChatSnippet> result = new ArrayList<>();
        for (Long id : ids) {
            Product product = byId.get(id);
            if (product == null) {
                continue;
            }
            result.add(new ProductChatSnippet(
                    product.getId(),
                    product.getName(),
                    product.getBasePrice(),
                    product.getBrand().getName(),
                    product.getCategory().getName()
            ));
        }
        return result;
    }

    /**
     * Parse [productId:123] từ text AI, giữ thứ tự, bỏ trùng.
     */
    private List<Long> extractProductIds(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        Matcher matcher = PRODUCT_ID_PATTERN.matcher(text);
        LinkedHashSet<Long> orderedUnique = new LinkedHashSet<>();

        while (matcher.find()) {
            try {
                long id = Long.parseLong(matcher.group(1));
                if (id > 0) {
                    orderedUnique.add(id);
                }
            } catch (NumberFormatException ignored) {
                // bỏ token không parse được
            }
        }

        return new ArrayList<>(orderedUnique);
    }
}