package com.sneakerstore.service;

import com.sneakerstore.dto.CartItemResponse;
import com.sneakerstore.dto.CartResponse;
import com.sneakerstore.entity.Cart;
import com.sneakerstore.entity.CartItem;
import com.sneakerstore.entity.ProductVariant;
import com.sneakerstore.entity.User;
import com.sneakerstore.exception.ResourceNotFoundException;
import com.sneakerstore.repository.CartItemRepository;
import com.sneakerstore.repository.CartRepository;
import com.sneakerstore.repository.ProductVariantRepository;
import com.sneakerstore.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.sneakerstore.dto.AddCartItemRequest;
import com.sneakerstore.dto.UpdateCartItemRequest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

        private final CartRepository cartRepository;
        private final CartItemRepository cartItemRepository;
        private final UserRepository userRepository;
        private final ProductVariantRepository productVariantRepository;

        public CartService(
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        UserRepository userRepository,
                        ProductVariantRepository productVariantRepository) {
                this.cartRepository = cartRepository;
                this.cartItemRepository = cartItemRepository;
                this.userRepository = userRepository;
                this.productVariantRepository = productVariantRepository;
        }

        /**
         * Lấy Cart của User hiện tại.
         *
         * User được xác định từ JWT đã được JwtAuthenticationFilter
         * đặt vào SecurityContext.
         */
        public CartResponse getCurrentUserCart() {

                User user = getCurrentUser();

                /*
                 * Một User chỉ có một Cart.
                 *
                 * Nếu User chưa từng có Cart thì tự tạo Cart mới.
                 */
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseGet(() -> createCart(user));

                return toCartResponse(cart);
        }

        /**
         * Thêm một ProductVariant vào Cart của User hiện tại.
         *
         * Không nhận userId từ Client.
         * Backend tự lấy User từ JWT.
         */
        @Transactional
        public CartResponse addItemToCart(
                        AddCartItemRequest request) {

                User user = getCurrentUser();

                /*
                 * Tìm Variant từ database.
                 *
                 * Client chỉ gửi productVariantId.
                 * Giá và stock luôn lấy từ database.
                 */
                ProductVariant variant = productVariantRepository
                                .findById(request.getProductVariantId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy product variant với id: "
                                                                + request.getProductVariantId()));

                /*
                 * Lấy Cart của User.
                 * Nếu chưa có thì tạo Cart mới.
                 */
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseGet(() -> createCart(user));

                /*
                 * Kiểm tra Cart đã có Variant này chưa.
                 */
                CartItem cartItem = cartItemRepository
                                .findByCartIdAndProductVariantId(
                                                cart.getId(),
                                                variant.getId())
                                .orElse(null);

                if (cartItem == null) {

                        /*
                         * Variant chưa có trong Cart.
                         *
                         * Kiểm tra stock trước khi tạo CartItem.
                         */
                        if (request.getQuantity() > variant.getStock()) {
                                throw new IllegalArgumentException(
                                                "Số lượng yêu cầu vượt quá tồn kho. "
                                                                + "Stock hiện tại: "
                                                                + variant.getStock());
                        }

                        cartItem = new CartItem();

                        cartItem.setCart(cart);
                        cartItem.setProductVariant(variant);
                        cartItem.setQuantity(request.getQuantity());

                } else {

                        /*
                         * Variant đã có trong Cart.
                         *
                         * Ví dụ:
                         *
                         * Cart đang có:
                         * quantity = 2
                         *
                         * User thêm:
                         * quantity = 3
                         *
                         * => quantity mới = 5
                         */
                        int newQuantity = cartItem.getQuantity()
                                        + request.getQuantity();

                        /*
                         * Kiểm tra tổng số lượng mới có vượt stock không.
                         */
                        if (newQuantity > variant.getStock()) {
                                throw new IllegalArgumentException(
                                                "Số lượng trong giỏ vượt quá tồn kho. "
                                                                + "Stock hiện tại: "
                                                                + variant.getStock());
                        }

                        cartItem.setQuantity(newQuantity);
                }

                /*
                 * Lưu CartItem.
                 */
                cartItemRepository.save(cartItem);

                /*
                 * Trả về Cart mới nhất để Frontend cập nhật giao diện ngay.
                 */
                return toCartResponse(cart);
        }

        /**
         * Cập nhật số lượng của một CartItem.
         *
         * Chỉ User sở hữu Cart mới được phép cập nhật CartItem đó.
         *
         * Luồng:
         * 1. Lấy User hiện tại từ JWT.
         * 2. Lấy Cart của User.
         * 3. Tìm CartItem theo itemId.
         * 4. Kiểm tra CartItem có thuộc Cart của User hay không.
         * 5. Kiểm tra quantity không vượt stock.
         * 6. Cập nhật quantity.
         */
        @Transactional
        public CartResponse updateCartItem(
                        Long itemId,
                        UpdateCartItemRequest request) {

                User user = getCurrentUser();

                /*
                 * Lấy Cart của User hiện tại.
                 */
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy cart của user hiện tại"));

                /*
                 * Tìm CartItem theo ID.
                 */
                CartItem cartItem = cartItemRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy cart item với id: "
                                                                + itemId));

                /*
                 * Kiểm tra CartItem có thực sự thuộc Cart
                 * của User hiện tại hay không.
                 *
                 * Điều này ngăn User A sửa CartItem của User B.
                 */
                if (!cartItem.getCart().getId().equals(cart.getId())) {
                        throw new ResourceNotFoundException(
                                        "Cart item không thuộc cart của user hiện tại");
                }

                ProductVariant variant = cartItem.getProductVariant();

                /*
                 * Kiểm tra quantity mới không vượt quá stock hiện tại.
                 */
                if (request.getQuantity() > variant.getStock()) {
                        throw new IllegalArgumentException(
                                        "Số lượng trong giỏ vượt quá tồn kho. "
                                                        + "Stock hiện tại: "
                                                        + variant.getStock());
                }

                /*
                 * Cập nhật số lượng.
                 *
                 * Validation @Positive trong DTO đã xử lý
                 * trường hợp quantity <= 0.
                 */
                cartItem.setQuantity(request.getQuantity());

                cartItemRepository.save(cartItem);

                /*
                 * Trả về Cart mới nhất để Frontend cập nhật giao diện.
                 */
                return toCartResponse(cart);
        }

        /**
         * Xóa một CartItem khỏi Cart của User hiện tại.
         *
         * Chỉ User sở hữu Cart mới có thể xóa CartItem đó.
         */
        @Transactional
        public CartResponse deleteCartItem(Long itemId) {

                User user = getCurrentUser();

                /*
                 * Lấy Cart của User hiện tại.
                 */
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy cart của user hiện tại"));

                /*
                 * Tìm CartItem.
                 */
                CartItem cartItem = cartItemRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy cart item với id: "
                                                                + itemId));

                /*
                 * Đảm bảo CartItem thuộc Cart của User hiện tại.
                 */
                if (!cartItem.getCart().getId().equals(cart.getId())) {
                        throw new ResourceNotFoundException(
                                        "Cart item không thuộc cart của user hiện tại");
                }

                /*
                 * Xóa CartItem.
                 */
                cartItemRepository.delete(cartItem);

                /*
                 * Trả về Cart sau khi xóa.
                 */
                return toCartResponse(cart);
        }

        /**
         * Xóa toàn bộ CartItem của User hiện tại.
         *
         * Cart vẫn được giữ lại.
         * Chỉ các sản phẩm bên trong Cart bị xóa.
         */
        @Transactional
        public CartResponse clearCart() {

                User user = getCurrentUser();

                /*
                 * Lấy Cart của User hiện tại.
                 */
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy cart của user hiện tại"));

                /*
                 * Xóa toàn bộ CartItem trong Cart.
                 *
                 * Cart không bị xóa.
                 */
                cartItemRepository.deleteByCartId(cart.getId());

                /*
                 * Trả về Cart rỗng sau khi xóa.
                 */
                return toCartResponse(cart);
        }

        /**
         * Lấy User hiện tại từ SecurityContext.
         *
         * Authentication.getName() chính là email,
         * vì CustomUserDetailsService của project đang dùng email
         * làm username.
         */
        private User getCurrentUser() {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                if (authentication == null
                                || !authentication.isAuthenticated()) {

                        throw new RuntimeException(
                                        "User chưa được xác thực");
                }

                String email = authentication.getName();

                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy user với email: "
                                                                + email));
        }

        /**
         * Tạo Cart mới cho User.
         */
        private Cart createCart(User user) {

                Cart cart = new Cart();

                cart.setUser(user);

                return cartRepository.save(cart);
        }

        /**
         * Chuyển Cart Entity thành CartResponse DTO.
         */
        private CartResponse toCartResponse(Cart cart) {

                List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

                List<CartItemResponse> itemResponses = new ArrayList<>();

                BigDecimal totalAmount = BigDecimal.ZERO;

                int totalItems = 0;

                for (CartItem cartItem : cartItems) {

                        ProductVariant variant = cartItem.getProductVariant();

                        BigDecimal unitPrice = variant.getPrice();

                        BigDecimal subtotal = unitPrice.multiply(
                                        BigDecimal.valueOf(
                                                        cartItem.getQuantity()));

                        CartItemResponse itemResponse = new CartItemResponse(
                                        cartItem.getId(),

                                        variant.getId(),

                                        variant.getProduct().getId(),
                                        variant.getProduct().getName(),

                                        variant.getSize().getId(),
                                        variant.getSize().getName(),

                                        variant.getColor().getId(),
                                        variant.getColor().getName(),

                                        unitPrice,

                                        variant.getStock(),

                                        cartItem.getQuantity(),

                                        subtotal);

                        itemResponses.add(itemResponse);

                        totalItems += cartItem.getQuantity();

                        totalAmount = totalAmount.add(subtotal);
                }

                return new CartResponse(
                                cart.getId(),
                                cart.getUser().getId(),
                                itemResponses,
                                totalItems,
                                totalAmount);
        }
}