package com.sneakerstore.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_user", columnList = "user_id"),
        @Index(name = "idx_order_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Order thuộc về một User.
     *
     * Một User có thể có nhiều Order.
     *
     * Không dùng cascade ở đây vì:
     * - Xóa Order không được phép xóa User.
     * - User là dữ liệu độc lập.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_user"))
    private User user;

    /*
     * Trạng thái đơn hàng.
     *
     * Dùng EnumType.STRING để database lưu:
     * PENDING
     * CONFIRMED
     * CANCELLED
     * COMPLETED
     *
     * Không lưu dạng số 0,1,2,3 để tránh việc thay đổi
     * thứ tự Enum làm sai dữ liệu cũ.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    /*
     * Tổng tiền của toàn bộ đơn hàng.
     *
     * Backend sẽ tính từ OrderItem khi checkout.
     *
     * Không tin totalAmount do Frontend gửi lên.
     */
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    /*
     * Một Order có nhiều OrderItem.
     *
     * Ví dụ:
     *
     * Order #1
     * ├── OrderItem #1
     * ├── OrderItem #2
     * └── OrderItem #3
     *
     * orphanRemoval giúp OrderItem không còn thuộc Order
     * sẽ được loại khỏi persistence context.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    /*
     * Thời điểm tạo đơn.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /*
     * Thời điểm cập nhật đơn gần nhất.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        /*
         * Nếu Service chưa thiết lập status,
         * mặc định đơn mới là PENDING.
         */
        if (status == null) {
            status = OrderStatus.PENDING;
        }

        /*
         * Nếu Service chưa thiết lập totalAmount,
         * khởi tạo bằng 0 để không vi phạm nullable=false.
         */
        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    /*
     * Helper method để thêm OrderItem.
     *
     * Giúp đảm bảo hai phía của quan hệ được đồng bộ:
     * Order -> items
     * OrderItem -> order
     */
    public void addItem(OrderItem item) {

        items.add(item);
        item.setOrder(this);
    }

    /*
     * Helper method để xóa OrderItem khỏi Order.
     */
    public void removeItem(OrderItem item) {

        items.remove(item);
        item.setOrder(null);
    }
}