package com.sneakerstore.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ProductUpdateRequest {

    /*
     * Tên sneaker.
     */
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200, message = "Tên sản phẩm không được vượt quá 200 ký tự")
    private String name;

    /*
     * Mô tả sản phẩm.
     */
    private String description;

    /*
     * Giá cơ bản.
     */
    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá cơ bản phải lớn hơn hoặc bằng 0")
    private BigDecimal basePrice;

    /*
     * Brand mới của Product.
     */
    @NotNull(message = "Brand ID không được để trống")
    private Long brandId;

    /*
     * Category mới của Product.
     */
    @NotNull(message = "Category ID không được để trống")
    private Long categoryId;
}