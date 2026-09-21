package com.sneakerstore.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sneakerstore.entity.Category;
import com.sneakerstore.repository.CategoryRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /*
     * API public để Frontend lấy danh sách danh mục.
     *
     * GET /api/categories
     *
     * Khách chưa đăng nhập vẫn cần dữ liệu Category
     * để thực hiện bộ lọc sản phẩm trên Storefront.
     */
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
}