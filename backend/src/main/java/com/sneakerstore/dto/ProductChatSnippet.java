package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Thông tin rút gọn để Frontend render Product Card trong chat AI.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductChatSnippet {

    private Long productId;

    private String name;

    private BigDecimal basePrice;

    private String brandName;

    private String categoryName;
}