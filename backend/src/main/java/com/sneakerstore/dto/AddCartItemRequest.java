package com.sneakerstore.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddCartItemRequest {

    @NotNull(message = "productVariantId không được để trống")
    private Long productVariantId;

    @NotNull(message = "quantity không được để trống")
    @Positive(message = "quantity phải lớn hơn 0")
    private Integer quantity;
}