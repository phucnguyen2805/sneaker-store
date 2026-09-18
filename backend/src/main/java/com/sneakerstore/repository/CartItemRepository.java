package com.sneakerstore.repository;

import com.sneakerstore.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    /*
     * Lấy tất cả item trong một Cart.
     */
    List<CartItem> findByCartId(Long cartId);

    /*
     * Tìm một CartItem theo Cart + ProductVariant.
     *
     * Điều này rất quan trọng:
     * nếu User thêm cùng một variant lần thứ hai,
     * chúng ta sẽ tăng quantity thay vì tạo CartItem trùng.
     */
    Optional<CartItem> findByCartIdAndProductVariantId(
            Long cartId,
            Long productVariantId);

    /*
     * Kiểm tra Cart có chứa variant này hay chưa.
     */
    boolean existsByCartIdAndProductVariantId(
            Long cartId,
            Long productVariantId);

    /*
     * Xóa một CartItem khỏi Cart.
     */
    void deleteByIdAndCartId(
            Long itemId,
            Long cartId);

    /*
     * Xóa toàn bộ item trong Cart.
     *
     * Sẽ sử dụng sau khi checkout thành công.
     */
    void deleteByCartId(Long cartId);
}