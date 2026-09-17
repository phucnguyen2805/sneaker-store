package com.sneakerstore.dto.productimage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {

    private Long id;

    private Long productId;

    private String imageUrl;

    private Boolean primary;

    private Integer displayOrder;
}