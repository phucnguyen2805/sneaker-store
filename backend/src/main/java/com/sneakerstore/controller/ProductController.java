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

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /*
     * =========================================================
     * GET ALL PRODUCTS
     * =========================================================
     *
     * GET /api/products
     *
     * Public API.
     *
     * Khách chưa đăng nhập cũng có thể xem danh sách sản phẩm.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        List<ProductResponse> products = productService.getAllProducts();

        return ResponseEntity.ok(products);
    }

    /*
     * =========================================================
     * GET PRODUCT BY ID
     * =========================================================
     *
     * GET /api/products/{id}
     *
     * Public API.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id) {

        ProductResponse product = productService.getProductById(id);

        return ResponseEntity.ok(product);
    }

    /*
     * =========================================================
     * CREATE PRODUCT
     * =========================================================
     *
     * POST /api/products
     *
     * Chỉ ADMIN được phép tạo Product.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {

        ProductResponse product = productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(product);
    }

    /*
     * =========================================================
     * UPDATE PRODUCT
     * =========================================================
     *
     * PUT /api/products/{id}
     *
     * Chỉ ADMIN được phép cập nhật.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {

        ProductResponse product = productService.updateProduct(id, request);

        return ResponseEntity.ok(product);
    }

    /*
     * =========================================================
     * DELETE PRODUCT
     * =========================================================
     *
     * DELETE /api/products/{id}
     *
     * Chỉ ADMIN được phép xóa.
     *
     * Lưu ý:
     * Product có Variant/Image nên chiến lược xóa dữ liệu
     * liên quan sẽ được hoàn thiện trước khi test DELETE
     * trên dữ liệu có quan hệ con.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }
}