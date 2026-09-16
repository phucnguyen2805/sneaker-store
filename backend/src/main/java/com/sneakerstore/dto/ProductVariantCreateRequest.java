package com.sneakerstore.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ProductVariantCreateRequest {

    /*
     * Product mà Variant thuộc về.
     */
    @NotNull(message = "Product ID không được để trống")
    private Long productId;

    /*
     * Size của Variant.
     */
    @NotNull(message = "Size ID không được để trống")
    private Long sizeId;

    /*
     * Color của Variant.
     */
    @NotNull(message = "Color ID không được để trống")
    private Long colorId;

    /*
     * Giá bán của Variant.
     *
     * Giá phải >= 0.
     */
    @NotNull(message = "Giá Variant không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá Variant phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    /*
     * Tồn kho của Variant.
     *
     * Không cho phép stock âm.
     */
    @NotNull(message = "Stock không được để trống")
    @Min(value = 0, message = "Stock phải lớn hơn hoặc bằng 0")
    private Integer stock;
}