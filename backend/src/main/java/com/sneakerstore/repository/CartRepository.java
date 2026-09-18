package com.sneakerstore.repository;

import com.sneakerstore.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    /*
     * Mỗi User chỉ có một Cart.
     *
     * Dùng user.id để tìm Cart của User đang đăng nhập.
     */
    Optional<Cart> findByUserId(Long userId);
}