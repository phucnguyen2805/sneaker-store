package com.sneakerstore.dto;

import com.sneakerstore.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    /*
     * Trạng thái mới của Order.
     *
     * Chỉ nhận các giá trị trong OrderStatus:
     * PENDING
     * CONFIRMED
     * CANCELLED
     * COMPLETED
     */
    @NotNull(message = "status không được để trống")
    private OrderStatus status;
}