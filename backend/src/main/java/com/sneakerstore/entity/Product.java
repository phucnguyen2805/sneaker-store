package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Tên sneaker.
     * Ví dụ:
     * Nike Air Force 1
     * Adidas Ultraboost 5
     */
    @Column(nullable = false, length = 200)
    private String name;

    /*
     * Mô tả chi tiết sản phẩm.
     *
     * Có thể chứa nhiều nội dung nên dùng TEXT
     * thay vì giới hạn vài trăm ký tự.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /*
     * Giá cơ bản của sản phẩm.
     *
     * Dùng BigDecimal thay vì double/float
     * để tránh sai số khi xử lý tiền.
     */
    @Column(name = "base_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal basePrice;

    /*
     * Một Product thuộc về đúng một Brand.
     *
     * Ví dụ:
     * Product = Nike Air Max
     * Brand = Nike
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_brand"))
    private Brand brand;

    /*
     * Một Product thuộc về đúng một Category.
     *
     * Ví dụ:
     * Product = Nike Air Max
     * Category = Running
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_category"))
    private Category category;

    /*
     * Một Product có thể có nhiều ProductVariant.
     *
     * Ví dụ:
     * Product = Nike Air Force 1
     *
     * Các variant:
     * - Size 40 + White
     * - Size 41 + White
     * - Size 40 + Black
     *
     * mappedBy = "product" trỏ tới field product
     * trong ProductVariant.
     *
     * Không tạo thêm cột mới trong bảng products.
     */
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<ProductVariant> variants;

    /*
     * Thời điểm tạo sản phẩm.
     *
     * Tạm thời dùng JPA để thiết lập giá trị
     * khi Entity mới được tạo.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /*
     * Thời điểm cập nhật sản phẩm gần nhất.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}