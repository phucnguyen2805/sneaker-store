package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_item_order", columnList = "order_id"),
        @Index(name = "idx_order_item_variant", columnList = "product_variant_id")
})
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * OrderItem thuộc về một Order.
     *
     * Một Order có thể có nhiều OrderItem.
     *
     * Quan hệ hai chiều:
     * Order
     * -> List<OrderItem>
     *
     * OrderItem
     * -> Order
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_item_order"))
    private Order order;

    /*
     * OrderItem tham chiếu tới ProductVariant.
     *
     * Variant xác định:
     * - Product
     * - Size
     * - Color
     *
     * Tuy nhiên OrderItem vẫn lưu snapshot thông tin sản phẩm
     * bên dưới để giữ nguyên dữ liệu tại thời điểm mua.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_item_variant"))
    private ProductVariant productVariant;

    /*
     * Snapshot tên Product tại thời điểm checkout.
     *
     * Ví dụ:
     * Nike Air Force 1 Updated
     *
     * Nếu sau này Product bị đổi tên,
     * Order cũ vẫn giữ tên tại thời điểm mua.
     */
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    /*
     * Snapshot Size tại thời điểm mua.
     */
    @Column(name = "size_name", nullable = false, length = 20)
    private String sizeName;

    /*
     * Snapshot Color tại thời điểm mua.
     */
    @Column(name = "color_name", nullable = false, length = 100)
    private String colorName;

    /*
     * Giá của một sản phẩm tại thời điểm checkout.
     *
     * Đây là snapshot rất quan trọng.
     *
     * Không dùng lại giá hiện tại của ProductVariant
     * khi xem đơn hàng cũ.
     */
    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    /*
     * Số lượng sản phẩm đã mua.
     */
    @Column(nullable = false)
    private Integer quantity;

    /*
     * Thành tiền của dòng OrderItem:
     *
     * subtotal = unitPrice * quantity
     *
     * Backend tự tính, không lấy từ Frontend.
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal;

    /*
     * Kiểm tra dữ liệu cơ bản trước khi lưu.
     */
    @PrePersist
    @PreUpdate
    protected void validateData() {

        if (unitPrice == null
                || unitPrice.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Order item unit price phải lớn hơn hoặc bằng 0");
        }

        if (quantity == null || quantity <= 0) {

            throw new IllegalArgumentException(
                    "Order item quantity phải lớn hơn 0");
        }

        if (subtotal == null
                || subtotal.compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Order item subtotal không hợp lệ");
        }
    }
}