package com.sneakerstore.service;

import com.sneakerstore.dto.OrderItemResponse;
import com.sneakerstore.dto.OrderResponse;
import com.sneakerstore.entity.Cart;
import com.sneakerstore.entity.CartItem;
import com.sneakerstore.entity.Order;
import com.sneakerstore.entity.OrderItem;
import com.sneakerstore.entity.OrderStatus;
import com.sneakerstore.entity.ProductVariant;
import com.sneakerstore.entity.User;
import com.sneakerstore.exception.ResourceNotFoundException;
import com.sneakerstore.repository.CartItemRepository;
import com.sneakerstore.repository.CartRepository;
import com.sneakerstore.repository.OrderRepository;
import com.sneakerstore.repository.ProductVariantRepository;
import com.sneakerstore.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

        private final OrderRepository orderRepository;
        private final CartRepository cartRepository;
        private final CartItemRepository cartItemRepository;
        private final ProductVariantRepository productVariantRepository;
        private final UserRepository userRepository;

        public OrderService(
                        OrderRepository orderRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        ProductVariantRepository productVariantRepository,
                        UserRepository userRepository) {
                this.orderRepository = orderRepository;
                this.cartRepository = cartRepository;
                this.cartItemRepository = cartItemRepository;
                this.productVariantRepository = productVariantRepository;
                this.userRepository = userRepository;
        }

        /**
         * Checkout Cart hiện tại thành Order.
         *
         * Toàn bộ quá trình nằm trong một transaction:
         *
         * Cart
         * ↓
         * CartItem
         * ↓
         * ProductVariant
         * ↓
         * kiểm tra stock
         * ↓
         * tạo Order
         * ↓
         * tạo OrderItem snapshot
         * ↓
         * trừ stock
         * ↓
         * xóa CartItem
         *
         * Nếu bất kỳ bước nào throw RuntimeException,
         * transaction sẽ rollback toàn bộ thay đổi database.
         */
        @Transactional
        public OrderResponse checkout() {

                User user = getCurrentUser();

                /*
                 * Lấy Cart của User hiện tại.
                 */
                /*
                 * Lấy Cart của User hiện tại.
                 *
                 * Nếu User chưa từng có Cart thì tạo Cart mới.
                 * Sau đó kiểm tra items bên dưới.
                 *
                 * Như vậy:
                 * - Chưa có Cart
                 * - Có Cart nhưng không có item
                 *
                 * đều được xem là "Cart rỗng" và trả 400 khi checkout.
                 */
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseGet(() -> createCart(user));

                /*
                 * Lấy toàn bộ CartItem.
                 */
                List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

                /*
                 * Không cho phép checkout Cart rỗng.
                 */
                if (cartItems.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "Cart đang trống, không thể checkout");
                }

                /*
                 * Tạo Order mới.
                 */
                Order order = new Order();

                order.setUser(user);
                order.setStatus(OrderStatus.PENDING);
                order.setTotalAmount(BigDecimal.ZERO);

                BigDecimal totalAmount = BigDecimal.ZERO;

                /*
                 * Xử lý từng CartItem.
                 */
                for (CartItem cartItem : cartItems) {

                        /*
                         * Lấy lại ProductVariant từ database.
                         *
                         * Không tin:
                         * - price từ Frontend
                         * - stock từ Frontend
                         * - product information từ Frontend
                         */
                        ProductVariant variant = productVariantRepository
                                        .findById(
                                                        cartItem
                                                                        .getProductVariant()
                                                                        .getId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Không tìm thấy product variant với id: "
                                                                        + cartItem
                                                                                        .getProductVariant()
                                                                                        .getId()));

                        /*
                         * Kiểm tra tồn kho thực tế.
                         */
                        if (cartItem.getQuantity() > variant.getStock()) {

                                throw new IllegalArgumentException(
                                                "Không đủ tồn kho cho variant id: "
                                                                + variant.getId()
                                                                + ". Stock hiện tại: "
                                                                + variant.getStock()
                                                                + ", số lượng yêu cầu: "
                                                                + cartItem.getQuantity());
                        }

                        /*
                         * Lấy giá hiện tại từ database.
                         */
                        BigDecimal unitPrice = variant.getPrice();

                        /*
                         * Tính subtotal.
                         */
                        BigDecimal subtotal = unitPrice.multiply(
                                        BigDecimal.valueOf(
                                                        cartItem.getQuantity()));

                        /*
                         * Tạo OrderItem.
                         */
                        OrderItem orderItem = new OrderItem();

                        orderItem.setProductVariant(variant);

                        /*
                         * Snapshot thông tin Product.
                         */
                        orderItem.setProductName(
                                        variant.getProduct().getName());

                        /*
                         * Snapshot Size.
                         */
                        orderItem.setSizeName(
                                        variant.getSize().getName());

                        /*
                         * Snapshot Color.
                         */
                        orderItem.setColorName(
                                        variant.getColor().getName());

                        /*
                         * Snapshot giá tại thời điểm mua.
                         */
                        orderItem.setUnitPrice(unitPrice);

                        orderItem.setQuantity(
                                        cartItem.getQuantity());

                        orderItem.setSubtotal(subtotal);

                        /*
                         * addItem() đồng thời:
                         *
                         * Order -> items
                         * OrderItem -> order
                         */
                        order.addItem(orderItem);

                        /*
                         * Cộng vào tổng Order.
                         */
                        totalAmount = totalAmount.add(subtotal);

                        /*
                         * Trừ stock của đúng ProductVariant.
                         */
                        variant.setStock(
                                        variant.getStock()
                                                        - cartItem.getQuantity());

                        /*
                         * save để Hibernate ghi thay đổi stock
                         * trong transaction hiện tại.
                         */
                        productVariantRepository.save(variant);
                }

                /*
                 * Gán tổng tiền sau khi đã tính toàn bộ OrderItem.
                 */
                order.setTotalAmount(totalAmount);

                /*
                 * Lưu Order.
                 *
                 * Cascade từ Order -> OrderItem
                 * sẽ lưu các OrderItem đi kèm.
                 */
                Order savedOrder = orderRepository.save(order);

                /*
                 * Chỉ xóa CartItem sau khi Order đã được tạo thành công.
                 */
                cartItemRepository.deleteByCartId(cart.getId());

                /*
                 * Trả Order vừa checkout.
                 */
                return toOrderResponse(savedOrder);
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
         * Lấy lịch sử đơn hàng của User hiện tại.
         *
         * Chỉ trả về những Order thuộc User đang đăng nhập.
         */
        @Transactional(readOnly = true)
        public List<OrderResponse> getCurrentUserOrders() {

                User user = getCurrentUser();

                return orderRepository
                                .findByUserIdOrderByCreatedAtDesc(user.getId())
                                .stream()
                                .map(this::toOrderResponse)
                                .toList();
        }

        /**
         * Lấy chi tiết một Order của User hiện tại.
         *
         * Dùng findByIdAndUserId để đảm bảo User chỉ xem
         * được đơn hàng của chính mình.
         */
        @Transactional(readOnly = true)
        public OrderResponse getCurrentUserOrderById(Long orderId) {

                User user = getCurrentUser();

                Order order = orderRepository
                                .findByIdAndUserId(
                                                orderId,
                                                user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy order với id: "
                                                                + orderId));

                return toOrderResponse(order);
        }

        /**
         * Admin cập nhật trạng thái Order.
         *
         * Các chuyển trạng thái hợp lệ:
         *
         * PENDING
         * ├──> CONFIRMED
         * └──> CANCELLED
         *
         * CONFIRMED
         * ├──> COMPLETED
         * └──> CANCELLED
         *
         * COMPLETED -> không được thay đổi
         * CANCELLED -> không được thay đổi
         *
         * Khi chuyển sang CANCELLED:
         * - Hoàn lại stock của từng ProductVariant.
         * - Tất cả thao tác nằm trong một transaction.
         *
         * Nhờ vậy nếu có lỗi trong quá trình hoàn stock,
         * trạng thái Order cũng không bị cập nhật dở dang.
         */
        @Transactional
        public OrderResponse updateOrderStatus(
                        Long orderId,
                        com.sneakerstore.dto.UpdateOrderStatusRequest request) {

                /*
                 * Tìm Order theo ID.
                 *
                 * API này dành cho ADMIN nên không dùng
                 * findByIdAndUserId().
                 */
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy order với id: "
                                                                + orderId));

                OrderStatus currentStatus = order.getStatus();
                OrderStatus newStatus = request.getStatus();

                /*
                 * Không cho phép gửi trạng thái giống trạng thái hiện tại.
                 */
                if (currentStatus == newStatus) {
                        throw new IllegalArgumentException(
                                        "Order đã ở trạng thái: " + currentStatus);
                }

                /*
                 * Kiểm tra chuyển trạng thái có hợp lệ hay không.
                 */
                boolean validTransition = false;

                if (currentStatus == OrderStatus.PENDING) {

                        validTransition = newStatus == OrderStatus.CONFIRMED
                                        || newStatus == OrderStatus.CANCELLED;

                } else if (currentStatus == OrderStatus.CONFIRMED) {

                        validTransition = newStatus == OrderStatus.COMPLETED
                                        || newStatus == OrderStatus.CANCELLED;
                }

                /*
                 * COMPLETED và CANCELLED là trạng thái kết thúc,
                 * không thể chuyển sang trạng thái khác.
                 */
                if (!validTransition) {
                        throw new IllegalArgumentException(
                                        "Không thể chuyển Order từ "
                                                        + currentStatus
                                                        + " sang "
                                                        + newStatus);
                }

                /*
                 * Nếu Order bị CANCELLED,
                 * hoàn lại stock cho từng ProductVariant.
                 *
                 * Ví dụ:
                 * Checkout:
                 * stock 10 -> 7
                 *
                 * Hủy Order mua 3:
                 * stock 7 -> 10
                 */
                if (newStatus == OrderStatus.CANCELLED) {

                        for (OrderItem item : order.getItems()) {

                                ProductVariant variant = productVariantRepository
                                                .findById(
                                                                item
                                                                                .getProductVariant()
                                                                                .getId())
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Không tìm thấy product variant với id: "
                                                                                + item
                                                                                                .getProductVariant()
                                                                                                .getId()));

                                variant.setStock(
                                                variant.getStock()
                                                                + item.getQuantity());

                                productVariantRepository.save(variant);
                        }
                }

                /*
                 * Cập nhật trạng thái sau khi mọi validation
                 * và logic hoàn stock đã sẵn sàng.
                 */
                order.setStatus(newStatus);

                Order updatedOrder = orderRepository.save(order);

                return toOrderResponse(updatedOrder);
        }

        /**
         * Lấy User hiện tại từ JWT/SecurityContext.
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
         * Chuyển Order Entity thành OrderResponse DTO.
         */
        private OrderResponse toOrderResponse(Order order) {

                List<OrderItemResponse> itemResponses = new ArrayList<>();

                for (OrderItem item : order.getItems()) {

                        OrderItemResponse response = new OrderItemResponse(
                                        item.getId(),
                                        item.getProductVariant().getId(),
                                        item.getProductName(),
                                        item.getSizeName(),
                                        item.getColorName(),
                                        item.getUnitPrice(),
                                        item.getQuantity(),
                                        item.getSubtotal());

                        itemResponses.add(response);
                }

                return new OrderResponse(
                                order.getId(),
                                order.getUser().getId(),
                                order.getStatus(),
                                order.getTotalAmount(),
                                order.getCreatedAt(),
                                order.getUpdatedAt(),
                                itemResponses);
        }
}