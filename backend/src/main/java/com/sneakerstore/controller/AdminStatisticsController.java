package com.sneakerstore.controller;

import com.sneakerstore.dto.AdminStatisticsResponse;
import com.sneakerstore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatisticsController {

    private final OrderService orderService;

    public AdminStatisticsController(OrderService orderService) {
        this.orderService = orderService;
    }

    /*
     * =========================================================
     * GET ADMIN STATISTICS
     * =========================================================
     *
     * GET /api/admin/statistics
     *
     * Chỉ ADMIN được xem thống kê.
     *
     * API trả về:
     * - Tổng số Product
     * - Tổng số Product Variant
     * - Tổng số Order
     * - Số Order theo từng trạng thái
     * - Tổng doanh thu từ Order COMPLETED
     * - Doanh thu theo từng tháng
     */
    @GetMapping
    public ResponseEntity<AdminStatisticsResponse> getStatistics() {

        AdminStatisticsResponse statistics = orderService.getAdminStatistics();

        return ResponseEntity.ok(statistics);
    }
}