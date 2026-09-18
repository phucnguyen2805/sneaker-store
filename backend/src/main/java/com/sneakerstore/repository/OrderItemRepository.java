package com.sneakerstore.repository;

import com.sneakerstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

    /*
     * Lấy toàn bộ OrderItem của một Order.
     */
    List<OrderItem> findByOrderId(Long orderId);
}