package com.sneakerstore.controller;

import com.sneakerstore.dto.OrderResponse;
import com.sneakerstore.dto.UpdateOrderStatusRequest;
import com.sneakerstore.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Checkout Cart hiện tại thành Order.
     *
     * User được xác định từ JWT.
     */
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout() {

        OrderResponse response = orderService.checkout();

        return ResponseEntity.ok(response);
    }

    /**
     * Lấy toàn bộ lịch sử Order của User hiện tại.
     *
     * Không nhận userId từ Client.
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getCurrentUserOrders() {

        List<OrderResponse> orders = orderService.getCurrentUserOrders();

        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy chi tiết một Order của User hiện tại.
     *
     * User chỉ xem được Order thuộc tài khoản của mình.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getCurrentUserOrderById(
            @PathVariable Long orderId) {

        OrderResponse response = orderService.getCurrentUserOrderById(orderId);

        return ResponseEntity.ok(response);
    }

    /**
     * Admin cập nhật trạng thái Order.
     *
     * Chỉ ADMIN được phép gọi API này.
     *
     * Ví dụ:
     *
     * PUT /api/orders/1/status
     *
     * Body:
     * {
     * "status": "CONFIRMED"
     * }
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        OrderResponse response = orderService.updateOrderStatus(
                orderId,
                request);

        return ResponseEntity.ok(response);
    }
}