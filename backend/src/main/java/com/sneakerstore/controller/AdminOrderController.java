package com.sneakerstore.controller;

import com.sneakerstore.dto.OrderResponse;
import com.sneakerstore.entity.OrderStatus;
import com.sneakerstore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /*
     * =========================================================
     * GET ALL ORDERS FOR ADMIN
     * =========================================================
     *
     * GET /api/admin/orders
     * GET /api/admin/orders?status=PENDING
     * GET /api/admin/orders?status=CONFIRMED
     * GET /api/admin/orders?status=CANCELLED
     * GET /api/admin/orders?status=COMPLETED
     *
     * Chỉ ADMIN được xem danh sách Order.
     *
     * status là optional:
     * - Không truyền status → lấy toàn bộ Order.
     * - Có status → chỉ lấy Order có trạng thái tương ứng.
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            @RequestParam(required = false) OrderStatus status) {

        List<OrderResponse> orders = orderService.getOrdersForAdmin(status);

        return ResponseEntity.ok(orders);
    }
}