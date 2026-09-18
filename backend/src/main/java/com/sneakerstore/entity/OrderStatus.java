package com.sneakerstore.entity;

public enum OrderStatus {

    /*
     * Đơn hàng vừa được tạo,
     * đang chờ xử lý.
     */
    PENDING,

    /*
     * Đơn hàng đã được xác nhận.
     */
    CONFIRMED,

    /*
     * Đơn hàng đã bị hủy.
     */
    CANCELLED,

    /*
     * Đơn hàng đã hoàn tất.
     */
    COMPLETED
}