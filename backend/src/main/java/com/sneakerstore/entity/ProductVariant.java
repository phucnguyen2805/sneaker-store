package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants", uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_variant", columnNames = { "product_id", "size_id", "color_id" })
}, indexes = {
        @Index(name = "idx_variant_product", columnList = "product_id"),
        @Index(name = "idx_variant_size", columnList = "size_id"),
        @Index(name = "idx_variant_color", columnList = "color_id")
})
@Getter
@Setter
@NoArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Variant thuộc về một Product.
     *
     * Ví dụ:
     * Product = Nike Air Force 1
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_variant_product"))
    private Product product;

    /*
     * Variant có đúng một Size.
     *
     * Ví dụ:
     * Size = 40
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "size_id", nullable = false, foreignKey = @ForeignKey(name = "fk_variant_size"))
    private Size size;

    /*
     * Variant có đúng một Color.
     *
     * Ví dụ:
     * Color = White
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "color_id", nullable = false, foreignKey = @ForeignKey(name = "fk_variant_color"))
    private Color color;

    /*
     * Giá bán thực tế của variant.
     *
     * Dùng BigDecimal để xử lý tiền chính xác.
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    /*
     * Số lượng tồn kho của đúng Size + Color này.
     *
     * Đây là field rất quan trọng đối với nghiệp vụ checkout.
     *
     * Ví dụ:
     * Product: Nike Air Force 1
     * Size: 40
     * Color: White
     * Stock: 8
     */
    @Column(nullable = false)
    private Integer stock;

    /*
     * Tránh tạo variant có số lượng tồn kho âm
     * ngay từ tầng Entity.
     *
     * Tuy nhiên khi checkout, Backend vẫn phải
     * kiểm tra stock trong Transaction để đảm bảo
     * dữ liệu tồn kho chính xác.
     */
    @PrePersist
    @PreUpdate
    protected void validateData() {
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Variant price must be greater than or equal to 0");
        }

        if (stock == null || stock < 0) {
            throw new IllegalArgumentException("Variant stock must be greater than or equal to 0");
        }
    }
}