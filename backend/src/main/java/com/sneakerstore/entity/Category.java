package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories", uniqueConstraints = {
        @UniqueConstraint(name = "uk_category_name", columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên danh mục phải là duy nhất.
     * Ví dụ: Running, Basketball, Lifestyle, Training
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * URL ảnh đại diện category trên Cloudinary.
     * Có thể null nếu chưa upload.
     */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    public Category(String name) {
        this.name = name;
    }

    public Category(String name, String imageUrl) {
        this.name = name;
        this.imageUrl = imageUrl;
    }
}