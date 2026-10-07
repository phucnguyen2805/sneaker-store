package com.sneakerstore.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sneakerstore.dto.CategoryResponse;
import com.sneakerstore.dto.CreateCategoryRequest;
import com.sneakerstore.dto.UpdateCategoryRequest;
import com.sneakerstore.entity.Category;
import com.sneakerstore.exception.DuplicateResourceException;
import com.sneakerstore.exception.ResourceNotFoundException;
import com.sneakerstore.repository.CategoryRepository;
import com.sneakerstore.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final Cloudinary cloudinary;

    public CategoryService(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            Cloudinary cloudinary
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.cloudinary = cloudinary;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return toResponse(findCategoryOrThrow(id));
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        String name = request.getName().trim();

        if (categoryRepository.existsByName(name)) {
            throw new DuplicateResourceException(
                    "Category \"" + name + "\" đã tồn tại"
            );
        }

        Category category = new Category(name);
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = findCategoryOrThrow(id);
        String name = request.getName().trim();

        if (categoryRepository.existsByNameAndIdNot(name, id)) {
            throw new DuplicateResourceException(
                    "Category \"" + name + "\" đã tồn tại"
            );
        }

        category.setName(name);
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategoryOrThrow(id);

        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể xóa category đang được dùng bởi "
                            + productCount + " sản phẩm"
            );
        }

        deleteCloudinaryImageQuietly(category.getImageUrl());
        categoryRepository.delete(category);
    }

    @Transactional
    public CategoryResponse uploadImage(Long id, MultipartFile file) {
        Category category = findCategoryOrThrow(id);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File ảnh không được để trống"
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File phải là ảnh (image/*)"
            );
        }

        try {
            deleteCloudinaryImageQuietly(category.getImageUrl());

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "sneaker-store/categories/" + id,
                            "resource_type", "image",
                            "use_filename", true,
                            "unique_filename", true,
                            "overwrite", false
                    )
            );

            String secureUrl = (String) uploadResult.get("secure_url");
            if (secureUrl == null || secureUrl.isBlank()) {
                throw new IllegalStateException("Cloudinary không trả về URL ảnh");
            }

            category.setImageUrl(secureUrl);
            return toResponse(categoryRepository.save(category));

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Không upload được ảnh lên Cloudinary: " + ex.getMessage()
            );
        }
    }

    @Transactional
    public CategoryResponse deleteImage(Long id) {
        Category category = findCategoryOrThrow(id);
        deleteCloudinaryImageQuietly(category.getImageUrl());
        category.setImageUrl(null);
        return toResponse(categoryRepository.save(category));
    }

    private Category findCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy category với id: " + id
                ));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getImageUrl()
        );
    }

    private void deleteCloudinaryImageQuietly(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        try {
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception ignored) {
        }
    }

    private String extractPublicId(String imageUrl) {
        String marker = "/upload/";
        int idx = imageUrl.indexOf(marker);
        if (idx < 0) {
            return null;
        }
        String afterUpload = imageUrl.substring(idx + marker.length());
        if (afterUpload.startsWith("v") && afterUpload.contains("/")) {
            afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
        }
        int dot = afterUpload.lastIndexOf('.');
        if (dot > 0) {
            afterUpload = afterUpload.substring(0, dot);
        }
        return afterUpload;
    }
}