package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ProductVariantResponse {

    /*
     * ID của Variant.
     */
    private Long id;

    /*
     * Thông tin Product.
     */
    private Long productId;
    private String productName;

    /*
     * Thông tin Size.
     */
    private Long sizeId;
    private String sizeName;

    /*
     * Thông tin Color.
     */
    private Long colorId;
    private String colorName;
    private String colorHexCode;

    /*
     * Giá bán thực tế của Variant.
     */
    private BigDecimal price;

    /*
     * Tồn kho hiện tại của đúng Variant.
     */
    private Integer stock;
}