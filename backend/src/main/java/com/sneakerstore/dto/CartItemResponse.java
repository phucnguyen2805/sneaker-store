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
public class CartItemResponse {

    private Long id;

    private Long productVariantId;

    private Long productId;
    private String productName;

    private Long sizeId;
    private String sizeName;

    private Long colorId;
    private String colorName;

    private BigDecimal unitPrice;

    private Integer stock;

    private Integer quantity;

    private BigDecimal subtotal;
}