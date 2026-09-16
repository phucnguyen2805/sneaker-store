package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SizeResponse {

    /*
     * ID của Size.
     */
    private Long id;

    /*
     * Tên Size.
     *
     * Ví dụ:
     * 38
     * 39
     * 40
     */
    private String name;
}