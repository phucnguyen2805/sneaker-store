package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "colors", uniqueConstraints = {
        @UniqueConstraint(name = "uk_color_name", columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
public class Color {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Tên màu được lưu riêng để các ProductVariant
     * có thể dùng lại cùng một màu.
     *
     * Ví dụ:
     * - White
     * - Black
     * - Red
     * - Blue
     */
    @Column(nullable = false, length = 50)
    private String name;

    /*
     * Lưu mã màu dạng HEX để Frontend sau này
     * có thể hiển thị màu trực quan.
     *
     * Ví dụ:
     * #FFFFFF
     * #000000
     * #FF0000
     */
    @Column(name = "hex_code", length = 7)
    private String hexCode;

    public Color(String name, String hexCode) {
        this.name = name;
        this.hexCode = hexCode;
    }
}