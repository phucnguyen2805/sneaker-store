package com.sneakerstore.controller;

import com.sneakerstore.dto.productimage.ProductImageResponse;
import com.sneakerstore.service.ProductImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductImageController {

    private final ProductImageService productImageService;

    public ProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    /**
     * Upload một ảnh cho Product.
     *
     * Chỉ ADMIN mới được phép upload.
     */
    @PostMapping("/{productId}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageResponse> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file) {
        ProductImageResponse productImage = productImageService.uploadImage(productId, file);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(productImage);
    }

    /**
     * Lấy danh sách ảnh của Product.
     *
     * API public để Frontend có thể hiển thị ảnh sản phẩm.
     */
    @GetMapping("/{productId}/images")
    public ResponseEntity<List<ProductImageResponse>> getImages(
            @PathVariable Long productId) {
        List<ProductImageResponse> images = productImageService.getImagesByProduct(productId);

        return ResponseEntity.ok(images);
    }

    /**
     * Xóa một ảnh của Product.
     *
     * Chỉ ADMIN mới được phép xóa.
     */
    @DeleteMapping("/{productId}/images/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {
        productImageService.deleteImage(productId, imageId);

        return ResponseEntity.noContent().build();
    }
}