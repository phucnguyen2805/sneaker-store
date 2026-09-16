package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sizes", uniqueConstraints = {
        @UniqueConstraint(name = "uk_size_name", columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
public class Size {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Tên size được lưu dưới dạng chuỗi để linh hoạt.
     *
     * Ví dụ:
     * - 38
     * - 39
     * - 40
     * - 41
     *
     * Sau này nếu bán thêm các loại size đặc biệt,
     * chúng ta không phải thay đổi kiểu dữ liệu của cột.
     */
    @Column(nullable = false, length = 20)
    private String name;

    public Size(String name) {
        this.name = name;
    }
}