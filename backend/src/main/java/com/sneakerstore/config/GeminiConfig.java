package com.sneakerstore.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Gemini API.
 * Key lấy từ biến môi trường GEMINI_API_KEY — không hard-code.
 * Phase AI-01 chỉ cấu hình; Phase AI-02 mới dùng để gọi API.
 */
@Configuration
public class GeminiConfig {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.base-url}")
    private String baseUrl;

    @Value("${gemini.model}")
    private String model;

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getModel() {
        return model;
    }

    /**
     * Kiểm tra key đã được set chưa (dùng ở AI-02 trước khi gọi Gemini).
     */
    public boolean isConfigured() {
        return apiKey != null
                && !apiKey.isBlank()
                && !apiKey.startsWith("your_");
    }
}