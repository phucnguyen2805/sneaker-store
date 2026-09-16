package com.sneakerstore.service;

import com.sneakerstore.dto.ProductCreateRequest;
import com.sneakerstore.dto.ProductResponse;
import com.sneakerstore.dto.ProductUpdateRequest;
import com.sneakerstore.entity.Brand;
import com.sneakerstore.entity.Category;
import com.sneakerstore.entity.Product;
import com.sneakerstore.exception.ResourceNotFoundException;
import com.sneakerstore.repository.BrandRepository;
import com.sneakerstore.repository.CategoryRepository;
import com.sneakerstore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            BrandRepository brandRepository,
            CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
    }

    /*
     * =========================================================
     * CREATE PRODUCT
     * =========================================================
     *
     * Luồng:
     *
     * ProductCreateRequest
     * ↓
     * Tìm Brand
     * ↓
     * Tìm Category
     * ↓
     * Tạo Product Entity
     * ↓
     * Lưu MySQL
     * ↓
     * ProductResponse
     */
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {

        /*
         * Tìm Brand theo brandId được gửi từ Client.
         *
         * Nếu không tồn tại → 404.
         */
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy Brand với id: "
                                + request.getBrandId()));

        /*
         * Tìm Category theo categoryId.
         */
        Category category = categoryRepository.findById(
                request.getCategoryId()).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy Category với id: "
                                        + request.getCategoryId()));

        /*
         * Tạo Product Entity.
         */
        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setBrand(brand);
        product.setCategory(category);

        /*
         * save() sẽ insert vào database.
         *
         * createdAt / updatedAt được Product Entity
         * tự thiết lập trong @PrePersist.
         */
        Product savedProduct = productRepository.save(product);

        return toProductResponse(savedProduct);
    }

    /*
     * =========================================================
     * GET ALL PRODUCTS
     * =========================================================
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::toProductResponse)
                .toList();
    }

    /*
     * =========================================================
     * GET PRODUCT BY ID
     * =========================================================
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy Product với id: "
                                + productId));

        return toProductResponse(product);
    }

    /*
     * =========================================================
     * UPDATE PRODUCT
     * =========================================================
     */
    @Transactional
    public ProductResponse updateProduct(
            Long productId,
            ProductUpdateRequest request) {

        /*
         * Tìm Product cần sửa.
         */
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy Product với id: "
                                + productId));

        /*
         * Tìm Brand mới.
         */
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy Brand với id: "
                                + request.getBrandId()));

        /*
         * Tìm Category mới.
         */
        Category category = categoryRepository.findById(
                request.getCategoryId()).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Không tìm thấy Category với id: "
                                        + request.getCategoryId()));

        /*
         * Cập nhật các field.
         */
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setBrand(brand);
        product.setCategory(category);

        /*
         * Vì Entity đang được quản lý trong transaction,
         * save() sẽ ghi thay đổi xuống database.
         */
        Product updatedProduct = productRepository.save(product);

        return toProductResponse(updatedProduct);
    }

    /*
     * =========================================================
     * DELETE PRODUCT
     * =========================================================
     */
    @Transactional
    public void deleteProduct(Long productId) {

        /*
         * Kiểm tra Product tồn tại trước khi xóa.
         */
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy Product với id: "
                                + productId));

        /*
         * Hiện tại Product có ProductVariant và ProductImage.
         *
         * Vì các bảng này có Foreign Key,
         * chúng ta chưa nên xóa Product trực tiếp
         * trước khi xử lý dữ liệu liên quan.
         *
         * Việc cascade/delete strategy sẽ được thiết kế
         * khi hoàn thiện Variant và Image.
         */
        productRepository.delete(product);
    }

    /*
     * =========================================================
     * ENTITY -> RESPONSE
     * =========================================================
     *
     * Không trả Entity trực tiếp ra Controller.
     */
    private ProductResponse toProductResponse(Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getBasePrice(),
                product.getBrand().getId(),
                product.getBrand().getName(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}