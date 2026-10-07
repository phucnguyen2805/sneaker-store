package com.sneakerstore.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sneakerstore.dto.BrandResponse;
import com.sneakerstore.dto.CreateBrandRequest;
import com.sneakerstore.dto.UpdateBrandRequest;
import com.sneakerstore.entity.Brand;
import com.sneakerstore.exception.DuplicateResourceException;
import com.sneakerstore.exception.ResourceNotFoundException;
import com.sneakerstore.repository.BrandRepository;
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
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final Cloudinary cloudinary;

    public BrandService(
            BrandRepository brandRepository,
            ProductRepository productRepository,
            Cloudinary cloudinary
    ) {
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
        this.cloudinary = cloudinary;
    }

    @Transactional(readOnly = true)
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BrandResponse getBrandById(Long id) {
        return toResponse(findBrandOrThrow(id));
    }

    @Transactional
    public BrandResponse createBrand(CreateBrandRequest request) {
        String name = request.getName().trim();

        if (brandRepository.existsByName(name)) {
            throw new DuplicateResourceException(
                    "Brand \"" + name + "\" đã tồn tại"
            );
        }

        Brand brand = new Brand(name);
        return toResponse(brandRepository.save(brand));
    }

    @Transactional
    public BrandResponse updateBrand(Long id, UpdateBrandRequest request) {
        Brand brand = findBrandOrThrow(id);
        String name = request.getName().trim();

        if (brandRepository.existsByNameAndIdNot(name, id)) {
            throw new DuplicateResourceException(
                    "Brand \"" + name + "\" đã tồn tại"
            );
        }

        brand.setName(name);
        return toResponse(brandRepository.save(brand));
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = findBrandOrThrow(id);

        long productCount = productRepository.countByBrandId(id);
        if (productCount > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể xóa brand đang được dùng bởi "
                            + productCount + " sản phẩm"
            );
        }

        // Xóa logo Cloudinary nếu có (best-effort)
        deleteCloudinaryImageQuietly(brand.getImageUrl());

        brandRepository.delete(brand);
    }

    /**
     * Upload logo lên Cloudinary, lưu URL vào brand.
     */
    @Transactional
    public BrandResponse uploadLogo(Long id, MultipartFile file) {
        Brand brand = findBrandOrThrow(id);

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
            // Xóa logo cũ trên Cloudinary (nếu có)
            deleteCloudinaryImageQuietly(brand.getImageUrl());

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "sneaker-store/brands/" + id,
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

            brand.setImageUrl(secureUrl);
            return toResponse(brandRepository.save(brand));

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Không upload được logo lên Cloudinary: " + ex.getMessage()
            );
        }
    }

    @Transactional
    public BrandResponse deleteLogo(Long id) {
        Brand brand = findBrandOrThrow(id);
        deleteCloudinaryImageQuietly(brand.getImageUrl());
        brand.setImageUrl(null);
        return toResponse(brandRepository.save(brand));
    }

    private Brand findBrandOrThrow(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy brand với id: " + id
                ));
    }

    private BrandResponse toResponse(Brand brand) {
        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getImageUrl()
        );
    }

    /**
     * Xóa ảnh Cloudinary theo secure_url.
     * Lỗi Cloudinary không làm fail nghiệp vụ DB.
     */
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
            // Không chặn flow chính
        }
    }

    /**
     * Ví dụ URL:
     * https://res.cloudinary.com/xxx/image/upload/v123/sneaker-store/brands/1/abc.jpg
     * public_id = sneaker-store/brands/1/abc
     */
    private String extractPublicId(String imageUrl) {
        String marker = "/upload/";
        int idx = imageUrl.indexOf(marker);
        if (idx < 0) {
            return null;
        }

        String afterUpload = imageUrl.substring(idx + marker.length());
        // Bỏ version v123456/
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