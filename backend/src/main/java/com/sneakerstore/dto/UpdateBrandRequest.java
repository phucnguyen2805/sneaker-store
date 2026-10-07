package com.sneakerstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateBrandRequest {

    @NotBlank(message = "Tên brand không được để trống")
    @Size(max = 100, message = "Tên brand tối đa 100 ký tự")
    private String name;
}