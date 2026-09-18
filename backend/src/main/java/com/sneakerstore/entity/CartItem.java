package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_cart_item_variant", columnNames = { "cart_id", "product_variant_id" })
}, indexes = {
        @Index(name = "idx_cart_item_cart", columnList = "cart_id"),
        @Index(name = "idx_cart_item_variant", columnList = "product_variant_id")
})
@Getter
@Setter
@NoArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * CartItem thuộc về một Cart.
     *
     * Ví dụ:
     * Cart #1
     * ├── CartItem #1
     * ├── CartItem #2
     * └── CartItem #3
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cart_item_cart"))
    private Cart cart;

    /*
     * CartItem trỏ tới đúng một ProductVariant.
     *
     * Variant đã xác định:
     * - Product
     * - Size
     * - Color
     * - Price
     * - Stock
     *
     * Vì vậy Cart không lưu riêng size/color,
     * mà chỉ cần tham chiếu tới ProductVariant.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_cart_item_variant"))
    private ProductVariant productVariant;

    /*
     * Số lượng variant mà User muốn mua.
     *
     * Ví dụ:
     * ProductVariant #5
     * quantity = 2
     */
    @Column(nullable = false)
    private Integer quantity;

    /*
     * Không cho phép quantity <= 0.
     *
     * Đây chỉ là kiểm tra cơ bản ở Entity.
     * Khi thêm vào giỏ hoặc checkout,
     * Service vẫn phải kiểm tra lại stock thực tế.
     */
    @PrePersist
    @PreUpdate
    protected void validateQuantity() {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Cart item quantity phải lớn hơn 0");
        }
    }
}