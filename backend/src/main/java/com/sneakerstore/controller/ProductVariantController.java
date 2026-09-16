package com.sneakerstore.controller;

import com.sneakerstore.dto.ProductVariantCreateRequest;
import com.sneakerstore.dto.ProductVariantResponse;
import com.sneakerstore.dto.ProductVariantUpdateRequest;
import com.sneakerstore.service.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    public ProductVariantController(
            ProductVariantService productVariantService) {
        this.productVariantService = productVariantService;
    }

    /*
     * =========================================================
     * CREATE VARIANT
     * =========================================================
     *
     * POST /api/products/{productId}/variants
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/products/{productId}/variants")
    public ResponseEntity<ProductVariantResponse> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantCreateRequest request) {

        /*
         * Đảm bảo Product ID trên URL và Body giống nhau.
         */
        if (!productId.equals(request.getProductId())) {
            throw new IllegalArgumentException(
                    "Product ID trong URL và request body không trùng nhau");
        }

        ProductVariantResponse response = productVariantService.createVariant(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * =========================================================
     * GET VARIANTS BY PRODUCT
     * =========================================================
     *
     * GET /api/products/{productId}/variants
     */
    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<List<ProductVariantResponse>> getVariantsByProduct(
            @PathVariable Long productId) {

        List<ProductVariantResponse> variants = productVariantService.getVariantsByProduct(productId);

        return ResponseEntity.ok(variants);
    }

    /*
     * =========================================================
     * GET VARIANT BY ID
     * =========================================================
     *
     * GET /api/variants/{id}
     */
    @GetMapping("/variants/{id}")
    public ResponseEntity<ProductVariantResponse> getVariantById(
            @PathVariable Long id) {

        ProductVariantResponse variant = productVariantService.getVariantById(id);

        return ResponseEntity.ok(variant);
    }

    /*
     * =========================================================
     * UPDATE VARIANT
     * =========================================================
     *
     * PUT /api/variants/{id}
     *
     * Chỉ ADMIN được cập nhật Variant.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/variants/{id}")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantUpdateRequest request) {

        ProductVariantResponse response = productVariantService.updateVariant(
                id,
                request);

        return ResponseEntity.ok(response);
    }
}