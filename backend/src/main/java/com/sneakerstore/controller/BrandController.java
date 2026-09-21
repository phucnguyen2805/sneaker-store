package com.sneakerstore.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sneakerstore.entity.Brand;
import com.sneakerstore.repository.BrandRepository;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final BrandRepository brandRepository;

    public BrandController(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    /*
     * API public để Frontend lấy danh sách thương hiệu.
     *
     * GET /api/brands
     *
     * Storefront cần dữ liệu này để hiển thị bộ lọc Brand
     * ngay cả khi khách chưa đăng nhập.
     */
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        return ResponseEntity.ok(brandRepository.findAll());
    }
}