package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ProductResponse {

    /*
     * ID sản phẩm.
     */
    private Long id;

    /*
     * Tên sneaker.
     */
    private String name;

    /*
     * Mô tả sản phẩm.
     */
    private String description;

    /*
     * Giá cơ bản.
     */
    private BigDecimal basePrice;

    /*
     * Thông tin Brand.
     */
    private Long brandId;
    private String brandName;

    /*
     * Thông tin Category.
     */
    private Long categoryId;
    private String categoryName;

    /*
     * Thời gian tạo.
     */
    private LocalDateTime createdAt;

    /*
     * Thời gian cập nhật.
     */
    private LocalDateTime updatedAt;
}