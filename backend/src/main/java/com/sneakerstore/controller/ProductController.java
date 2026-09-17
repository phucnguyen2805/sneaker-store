package com.sneakerstore.controller;

import com.sneakerstore.dto.ProductCreateRequest;
import com.sneakerstore.dto.ProductResponse;
import com.sneakerstore.dto.ProductUpdateRequest;
import com.sneakerstore.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Lấy toàn bộ Product.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts());
    }

    /**
     * Tìm kiếm và lọc Product.
     *
     * Có thể dùng riêng từng điều kiện hoặc kết hợp nhiều điều kiện.
     *
     * Ví dụ:
     *
     * GET /api/products/search?keyword=nike
     * GET /api/products/search?brandId=1
     * GET /api/products/search?categoryId=2
     * GET /api/products/search?sizeId=1
     * GET /api/products/search?minPrice=1000000
     * GET /api/products/search?minPrice=1000000&maxPrice=3000000
     *
     * Có thể kết hợp:
     *
     * GET /api/products/search
     * ?keyword=air
     * &brandId=1
     * &categoryId=2
     * &sizeId=1
     * &minPrice=1000000
     * &maxPrice=3000000
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(

            @RequestParam(required = false) String keyword,

            @RequestParam(required = false) Long brandId,

            @RequestParam(required = false) Long categoryId,

            @RequestParam(required = false) Long sizeId,

            @RequestParam(required = false) BigDecimal minPrice,

            @RequestParam(required = false) BigDecimal maxPrice) {

        List<ProductResponse> products = productService.searchProducts(
                keyword,
                brandId,
                categoryId,
                sizeId,
                minPrice,
                maxPrice);

        return ResponseEntity.ok(products);
    }

    /**
     * Lấy Product theo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productService.getProductById(id));
    }

    /**
     * Tạo Product.
     *
     * Chỉ ADMIN.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {

        ProductResponse response = productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Cập nhật Product.
     *
     * Chỉ ADMIN.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {

        ProductResponse response = productService.updateProduct(
                id,
                request);

        return ResponseEntity.ok(response);
    }

    /**
     * Xóa Product.
     *
     * Chỉ ADMIN.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }
}