package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long id;

    private Long productVariantId;

    private String productName;

    private String sizeName;

    private String colorName;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal subtotal;
}