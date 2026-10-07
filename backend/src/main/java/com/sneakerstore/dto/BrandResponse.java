package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BrandResponse {

    private Long id;
    private String name;
    private String imageUrl;
}