package com.sneakerstore.repository;

import com.sneakerstore.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

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
}