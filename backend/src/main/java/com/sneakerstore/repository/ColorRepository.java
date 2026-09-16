package com.sneakerstore.repository;

import com.sneakerstore.entity.Color;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ColorRepository extends JpaRepository<Color, Long> {

    /*
     * Tìm Color theo tên.
     *
     * Ví dụ:
     * "White"
     * "Black"
     * "Red"
     */
    Optional<Color> findByName(String name);

    /*
     * Kiểm tra Color đã tồn tại hay chưa.
     *
     * Dùng để tránh tạo trùng màu.
     */
    boolean existsByName(String name);
}