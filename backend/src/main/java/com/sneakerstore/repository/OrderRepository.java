package com.sneakerstore.repository;

import com.sneakerstore.entity.Order;
import com.sneakerstore.entity.OrderStatus;
import com.sneakerstore.dto.MonthlyRevenueResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /*
     * Lấy toàn bộ đơn hàng của một User.
     *
     * Đơn mới nhất được trả về trước.
     */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    /*
     * Tìm một Order theo ID và User.
     *
     * Dùng khi User xem chi tiết đơn hàng của chính mình.
     *
     * Điều kiện User ID rất quan trọng để tránh:
     * User A xem được Order của User B.
     */
    Optional<Order> findByIdAndUserId(
            Long id,
            Long userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    @Query("""
            SELECT new com.sneakerstore.dto.MonthlyRevenueResponse(
                YEAR(o.createdAt),
                MONTH(o.createdAt),
                COUNT(o.id),
                SUM(o.totalAmount)
            )
            FROM Order o
            WHERE o.status = com.sneakerstore.entity.OrderStatus.COMPLETED
            GROUP BY
                YEAR(o.createdAt),
                MONTH(o.createdAt)
            ORDER BY
                YEAR(o.createdAt),
                MONTH(o.createdAt)
            """)
    List<MonthlyRevenueResponse> findMonthlyRevenue();

    long countByStatus(OrderStatus status);

    @Query("""
            SELECT COALESCE(SUM(o.totalAmount), 0)
            FROM Order o
            WHERE o.status = com.sneakerstore.entity.OrderStatus.COMPLETED
            """)
    BigDecimal sumCompletedRevenue();
}