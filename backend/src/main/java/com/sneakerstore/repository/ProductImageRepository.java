package com.sneakerstore.repository;

import com.sneakerstore.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository
        extends JpaRepository<ProductImage, Long> {

    /**
     * Lấy toàn bộ ảnh của một Product theo thứ tự hiển thị.
     */
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(
            Long productId);

    /**
     * Lấy ảnh theo Product và đánh dấu primary.
     */
    Optional<ProductImage> findByProductIdAndPrimaryTrue(
            Long productId);

    /**
     * Kiểm tra Product đã có ảnh primary hay chưa.
     */
    boolean existsByProductIdAndPrimaryTrue(
            Long productId);

    /**
     * Xóa toàn bộ ảnh của Product.
     */
    void deleteByProductId(Long productId);
}