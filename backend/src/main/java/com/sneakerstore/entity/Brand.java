package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "brands", uniqueConstraints = {
        @UniqueConstraint(name = "uk_brand_name", columnNames = "name")
})
@Getter
@Setter
@NoArgsConstructor
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên thương hiệu phải là duy nhất.
     * Ví dụ: Nike, Adidas, Puma...
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * URL logo brand trên Cloudinary.
     * Có thể null nếu chưa upload.
     */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    public Brand(String name) {
        this.name = name;
    }

    public Brand(String name, String imageUrl) {
        this.name = name;
        this.imageUrl = imageUrl;
    }
}