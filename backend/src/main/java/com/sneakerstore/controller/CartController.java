package com.sneakerstore.controller;

import com.sneakerstore.dto.AddCartItemRequest;
import com.sneakerstore.dto.CartResponse;
import com.sneakerstore.dto.UpdateCartItemRequest;
import com.sneakerstore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * Lấy Cart của User đang đăng nhập.
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCurrentUserCart() {

        CartResponse response = cartService.getCurrentUserCart();

        return ResponseEntity.ok(response);
    }

    /**
     * Thêm một ProductVariant vào Cart.
     */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            @Valid @RequestBody AddCartItemRequest request) {

        CartResponse response = cartService.addItemToCart(request);

        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật số lượng của CartItem.
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {

        CartResponse response = cartService.updateCartItem(
                itemId,
                request);

        return ResponseEntity.ok(response);
    }

    /**
     * Xóa một CartItem khỏi Cart.
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> deleteCartItem(
            @PathVariable Long itemId) {

        CartResponse response = cartService.deleteCartItem(itemId);

        return ResponseEntity.ok(response);
    }

    /**
     * Xóa toàn bộ CartItem của User hiện tại.
     *
     * Cart vẫn được giữ lại, chỉ xóa các sản phẩm bên trong.
     */
    @DeleteMapping("/items")
    public ResponseEntity<CartResponse> clearCart() {

        CartResponse response = cartService.clearCart();

        return ResponseEntity.ok(response);
    }
}