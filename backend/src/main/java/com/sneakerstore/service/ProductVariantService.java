package com.sneakerstore.service;

import com.sneakerstore.dto.ProductVariantCreateRequest;
import com.sneakerstore.dto.ProductVariantResponse;
import com.sneakerstore.dto.ProductVariantUpdateRequest;
import com.sneakerstore.entity.Color;
import com.sneakerstore.entity.Product;
import com.sneakerstore.entity.ProductVariant;
import com.sneakerstore.entity.Size;
import com.sneakerstore.exception.DuplicateResourceException;
import com.sneakerstore.exception.ResourceNotFoundException;
import com.sneakerstore.repository.ColorRepository;
import com.sneakerstore.repository.ProductRepository;
import com.sneakerstore.repository.ProductVariantRepository;
import com.sneakerstore.repository.SizeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductVariantService {

        private final ProductVariantRepository productVariantRepository;
        private final ProductRepository productRepository;
        private final SizeRepository sizeRepository;
        private final ColorRepository colorRepository;

        public ProductVariantService(
                        ProductVariantRepository productVariantRepository,
                        ProductRepository productRepository,
                        SizeRepository sizeRepository,
                        ColorRepository colorRepository) {
                this.productVariantRepository = productVariantRepository;
                this.productRepository = productRepository;
                this.sizeRepository = sizeRepository;
                this.colorRepository = colorRepository;
        }

        /*
         * =========================================================
         * CREATE VARIANT
         * =========================================================
         */
        @Transactional
        public ProductVariantResponse createVariant(
                        ProductVariantCreateRequest request) {

                /*
                 * Tìm Product.
                 */
                Product product = productRepository.findById(
                                request.getProductId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Không tìm thấy Product với id: "
                                                                                + request.getProductId()));

                /*
                 * Tìm Size.
                 */
                Size size = sizeRepository.findById(
                                request.getSizeId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Không tìm thấy Size với id: "
                                                                                + request.getSizeId()));

                /*
                 * Tìm Color.
                 */
                Color color = colorRepository.findById(
                                request.getColorId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Không tìm thấy Color với id: "
                                                                                + request.getColorId()));

                /*
                 * Product + Size + Color phải là duy nhất.
                 */
                if (productVariantRepository
                                .existsByProductIdAndSizeIdAndColorId(
                                                request.getProductId(),
                                                request.getSizeId(),
                                                request.getColorId())) {

                        throw new DuplicateResourceException(
                                        "Product Variant với Product + Size + Color này đã tồn tại");
                }

                ProductVariant variant = new ProductVariant();

                variant.setProduct(product);
                variant.setSize(size);
                variant.setColor(color);
                variant.setPrice(request.getPrice());
                variant.setStock(request.getStock());

                ProductVariant savedVariant = productVariantRepository.save(variant);

                return toProductVariantResponse(savedVariant);
        }

        /*
         * =========================================================
         * GET VARIANTS BY PRODUCT
         * =========================================================
         */
        @Transactional(readOnly = true)
        public List<ProductVariantResponse> getVariantsByProduct(
                        Long productId) {

                productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy Product với id: "
                                                                + productId));

                return productVariantRepository
                                .findByProductId(productId)
                                .stream()
                                .map(this::toProductVariantResponse)
                                .toList();
        }

        /*
         * =========================================================
         * GET VARIANT BY ID
         * =========================================================
         */
        @Transactional(readOnly = true)
        public ProductVariantResponse getVariantById(
                        Long variantId) {

                ProductVariant variant = productVariantRepository.findById(variantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy Product Variant với id: "
                                                                + variantId));

                return toProductVariantResponse(variant);
        }

        /*
         * =========================================================
         * UPDATE VARIANT
         * =========================================================
         *
         * Cập nhật:
         *
         * Product
         * Size
         * Color
         * Price
         * Stock
         *
         * Nhưng phải đảm bảo tổ hợp:
         *
         * Product + Size + Color
         *
         * không trùng với một Variant khác.
         */
        @Transactional
        public ProductVariantResponse updateVariant(
                        Long variantId,
                        ProductVariantUpdateRequest request) {

                /*
                 * Tìm Variant cần cập nhật.
                 */
                ProductVariant variant = productVariantRepository.findById(variantId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy Product Variant với id: "
                                                                + variantId));

                /*
                 * Tìm Product mới.
                 */
                Product product = productRepository.findById(
                                request.getProductId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Không tìm thấy Product với id: "
                                                                                + request.getProductId()));

                /*
                 * Tìm Size mới.
                 */
                Size size = sizeRepository.findById(
                                request.getSizeId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Không tìm thấy Size với id: "
                                                                                + request.getSizeId()));

                /*
                 * Tìm Color mới.
                 */
                Color color = colorRepository.findById(
                                request.getColorId()).orElseThrow(
                                                () -> new ResourceNotFoundException(
                                                                "Không tìm thấy Color với id: "
                                                                                + request.getColorId()));

                /*
                 * Kiểm tra tổ hợp Product + Size + Color mới
                 * có đang được sử dụng bởi Variant khác không.
                 *
                 * Nếu Variant hiện tại chính là tổ hợp đó thì
                 * không được coi là duplicate.
                 */
                ProductVariant existingVariant = productVariantRepository
                                .findByProductIdAndSizeIdAndColorId(
                                                request.getProductId(),
                                                request.getSizeId(),
                                                request.getColorId())
                                .orElse(null);

                if (existingVariant != null
                                && !existingVariant.getId().equals(variantId)) {

                        throw new DuplicateResourceException(
                                        "Product Variant với Product + Size + Color này đã tồn tại");
                }

                /*
                 * Cập nhật Variant.
                 */
                variant.setProduct(product);
                variant.setSize(size);
                variant.setColor(color);
                variant.setPrice(request.getPrice());
                variant.setStock(request.getStock());

                /*
                 * @PreUpdate trong Entity sẽ tiếp tục kiểm tra:
                 *
                 * price >= 0
                 * stock >= 0
                 */
                ProductVariant updatedVariant = productVariantRepository.save(variant);

                return toProductVariantResponse(updatedVariant);
        }

        /*
         * =========================================================
         * ENTITY -> RESPONSE
         * =========================================================
         */
        private ProductVariantResponse toProductVariantResponse(
                        ProductVariant variant) {

                return new ProductVariantResponse(
                                variant.getId(),

                                variant.getProduct().getId(),
                                variant.getProduct().getName(),

                                variant.getSize().getId(),
                                variant.getSize().getName(),

                                variant.getColor().getId(),
                                variant.getColor().getName(),
                                variant.getColor().getHexCode(),

                                variant.getPrice(),
                                variant.getStock());
        }
}