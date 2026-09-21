package com.sneakerstore.dto;

import java.math.BigDecimal;
import java.util.List;

public class AdminStatisticsResponse {

    private final Long totalProducts;
    private final Long totalVariants;

    private final Long totalOrders;
    private final Long pendingOrders;
    private final Long confirmedOrders;
    private final Long completedOrders;
    private final Long cancelledOrders;

    private final BigDecimal totalRevenue;

    private final List<MonthlyRevenueResponse> monthlyRevenue;

    public AdminStatisticsResponse(
            Long totalProducts,
            Long totalVariants,
            Long totalOrders,
            Long pendingOrders,
            Long confirmedOrders,
            Long completedOrders,
            Long cancelledOrders,
            BigDecimal totalRevenue,
            List<MonthlyRevenueResponse> monthlyRevenue) {

        this.totalProducts = totalProducts;
        this.totalVariants = totalVariants;
        this.totalOrders = totalOrders;
        this.pendingOrders = pendingOrders;
        this.confirmedOrders = confirmedOrders;
        this.completedOrders = completedOrders;
        this.cancelledOrders = cancelledOrders;
        this.totalRevenue = totalRevenue;
        this.monthlyRevenue = monthlyRevenue;
    }

    public Long getTotalProducts() {
        return totalProducts;
    }

    public Long getTotalVariants() {
        return totalVariants;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public Long getPendingOrders() {
        return pendingOrders;
    }

    public Long getConfirmedOrders() {
        return confirmedOrders;
    }

    public Long getCompletedOrders() {
        return completedOrders;
    }

    public Long getCancelledOrders() {
        return cancelledOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public List<MonthlyRevenueResponse> getMonthlyRevenue() {
        return monthlyRevenue;
    }
}