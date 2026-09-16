package com.sneakerstore.repository;

import com.sneakerstore.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    /*
     * Tìm Category theo tên.
     *
     * Ví dụ:
     * "Running"
     * "Lifestyle"
     * "Basketball"
     */
    Optional<Category> findByName(String name);

    /*
     * Kiểm tra tên Category đã tồn tại chưa.
     *
     * Sau này sẽ dùng khi Admin tạo Category mới.
     */
    boolean existsByName(String name);
}