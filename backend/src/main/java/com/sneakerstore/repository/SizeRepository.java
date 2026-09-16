package com.sneakerstore.repository;

import com.sneakerstore.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SizeRepository extends JpaRepository<Size, Long> {

    /*
     * Tìm Size theo tên.
     *
     * Ví dụ:
     * "38"
     * "39"
     * "40"
     */
    Optional<Size> findByName(String name);

    /*
     * Kiểm tra Size đã tồn tại hay chưa.
     *
     * Dùng để tránh tạo trùng Size.
     */
    boolean existsByName(String name);
}