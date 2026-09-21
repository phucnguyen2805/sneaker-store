package com.sneakerstore.dto;

import java.math.BigDecimal;

public class MonthlyRevenueResponse {

    private final Integer year;
    private final Integer month;
    private final Long orderCount;
    private final BigDecimal revenue;

    public MonthlyRevenueResponse(
            Integer year,
            Integer month,
            Long orderCount,
            BigDecimal revenue) {

        this.year = year;
        this.month = month;
        this.orderCount = orderCount;
        this.revenue = revenue;
    }

    public Integer getYear() {
        return year;
    }

    public Integer getMonth() {
        return month;
    }

    public Long getOrderCount() {
        return orderCount;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }
}