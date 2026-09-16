package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_images", indexes = {
        @Index(name = "idx_product_image_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Mỗi ảnh thuộc về đúng một Product.
     *
     * Một Product có thể có nhiều ảnh:
     *
     * Nike Air Force 1
     * ├── ảnh chính
     * ├── ảnh mặt bên
     * ├── ảnh phía sau
     * └── ảnh chi tiết
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_image_product"))
    private Product product;

    /*
     * Đường dẫn hoặc URL tới file ảnh.
     *
     * Ví dụ:
     * https://example.com/images/nike-air-force-1-1.jpg
     *
     * Ở Phase 3 chúng ta mới quyết định cách upload/lưu ảnh
     * (Cloudinary, Cloud Storage hoặc giải pháp khác).
     */
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    /*
     * Xác định đây có phải ảnh đại diện chính của sản phẩm hay không.
     *
     * Ví dụ:
     * true -> ảnh chính
     * false -> ảnh phụ
     */
    @Column(name = "is_primary", nullable = false)
    private Boolean primary = false;

    /*
     * Thứ tự hiển thị ảnh ở Frontend.
     *
     * Ví dụ:
     * 1 -> ảnh đầu tiên
     * 2 -> ảnh thứ hai
     * 3 -> ảnh thứ ba
     */
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    public ProductImage(
            Product product,
            String imageUrl,
            Boolean primary,
            Integer displayOrder) {
        this.product = product;
        this.imageUrl = imageUrl;
        this.primary = primary;
        this.displayOrder = displayOrder;
    }
}