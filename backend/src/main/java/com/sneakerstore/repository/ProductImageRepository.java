package com.sneakerstore.repository;

import com.sneakerstore.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    /*
     * Lấy toàn bộ ảnh của một Product.
     *
     * Sắp xếp theo displayOrder để Frontend
     * nhận được ảnh đúng thứ tự hiển thị.
     */
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);

    /*
     * Tìm ảnh chính của một Product.
     */
    Optional<ProductImage> findByProductIdAndPrimaryTrue(Long productId);

    /*
     * Kiểm tra Product đã có ảnh chính hay chưa.
     */
    boolean existsByProductIdAndPrimaryTrue(Long productId);

    /*
     * Xóa toàn bộ ảnh thuộc một Product.
     *
     * Sau này sẽ hữu ích khi Admin cập nhật
     * hoặc xóa toàn bộ ảnh của sản phẩm.
     */
    void deleteByProductId(Long productId);
}