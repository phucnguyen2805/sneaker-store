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
public class ProductCreateRequest {

    /*
     * Tên sneaker.
     */
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200, message = "Tên sản phẩm không được vượt quá 200 ký tự")
    private String name;

    /*
     * Mô tả sản phẩm.
     *
     * Có thể để trống.
     */
    private String description;

    /*
     * Giá cơ bản của sản phẩm.
     *
     * Dùng BigDecimal để tránh sai số khi xử lý tiền.
     */
    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá cơ bản phải lớn hơn hoặc bằng 0")
    private BigDecimal basePrice;

    /*
     * ID của Brand.
     *
     * Frontend chỉ cần gửi:
     *
     * "brandId": 1
     *
     * Backend sẽ tự tìm Brand tương ứng
     * từ database.
     */
    @NotNull(message = "Brand ID không được để trống")
    private Long brandId;

    /*
     * ID của Category.
     *
     * Frontend chỉ cần gửi:
     *
     * "categoryId": 2
     *
     * Backend sẽ tự tìm Category tương ứng.
     */
    @NotNull(message = "Category ID không được để trống")
    private Long categoryId;
}