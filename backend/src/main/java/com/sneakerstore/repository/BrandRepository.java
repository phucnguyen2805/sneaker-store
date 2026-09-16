package com.sneakerstore.repository;

import com.sneakerstore.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    /*
     * Tìm Brand theo tên.
     *
     * Dùng Optional để tránh phải trả về null
     * khi không tìm thấy dữ liệu.
     */
    Optional<Brand> findByName(String name);

    /*
     * Kiểm tra xem tên Brand đã tồn tại hay chưa.
     *
     * Sẽ hữu ích khi Admin tạo Brand mới,
     * tránh tạo hai Brand có cùng tên.
     */
    boolean existsByName(String name);
}