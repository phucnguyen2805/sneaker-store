package com.sneakerstore.repository;

import com.sneakerstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProductRepository
        extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    /*
     * Tìm Product theo tên chính xác.
     *
     * Optional giúp xử lý trường hợp không tìm thấy
     * mà không cần trả về null.
     */
    Optional<Product> findByName(String name);

    /*
     * Kiểm tra xem Product có tên này đã tồn tại chưa.
     */
    boolean existsByName(String name);
}