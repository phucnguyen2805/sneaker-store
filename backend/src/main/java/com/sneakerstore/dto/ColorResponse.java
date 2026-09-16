package com.sneakerstore.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ColorResponse {

    /*
     * ID của Color.
     */
    private Long id;

    /*
     * Tên màu.
     *
     * Ví dụ:
     * White
     * Black
     * Red
     */
    private String name;

    /*
     * Mã màu HEX.
     *
     * Ví dụ:
     * #FFFFFF
     * #000000
     */
    private String hexCode;
}