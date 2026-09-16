package com.sneakerstore.repository;

import com.sneakerstore.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /*
     * Tìm một Variant cụ thể theo:
     * Product + Size + Color.
     */
    Optional<ProductVariant> findByProductIdAndSizeIdAndColorId(
            Long productId,
            Long sizeId,
            Long colorId);

    /*
     * Kiểm tra Variant đã tồn tại chưa.
     */
    boolean existsByProductIdAndSizeIdAndColorId(
            Long productId,
            Long sizeId,
            Long colorId);

    /*
     * Lấy toàn bộ Variant của một Product.
     */
    List<ProductVariant> findByProductId(Long productId);
}