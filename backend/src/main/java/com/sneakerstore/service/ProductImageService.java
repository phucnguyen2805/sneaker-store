package com.sneakerstore.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sneakerstore.dto.productimage.ProductImageResponse;
import com.sneakerstore.entity.Product;
import com.sneakerstore.entity.ProductImage;
import com.sneakerstore.exception.ResourceNotFoundException;
import com.sneakerstore.repository.ProductImageRepository;
import com.sneakerstore.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ProductImageService {

        private final Cloudinary cloudinary;
        private final ProductRepository productRepository;
        private final ProductImageRepository productImageRepository;

        public ProductImageService(
                        Cloudinary cloudinary,
                        ProductRepository productRepository,
                        ProductImageRepository productImageRepository) {
                this.cloudinary = cloudinary;
                this.productRepository = productRepository;
                this.productImageRepository = productImageRepository;
        }

        /**
         * Upload một ảnh cho Product.
         */
        public ProductImageResponse uploadImage(
                        Long productId,
                        MultipartFile file) {
                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy product với id: " + productId));

                if (file == null || file.isEmpty()) {
                        throw new IllegalArgumentException(
                                        "File ảnh không được để trống");
                }

                try {
                        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                                        file.getBytes(),
                                        ObjectUtils.asMap(
                                                        "folder",
                                                        "sneaker-store/products/" + productId,
                                                        "resource_type",
                                                        "image",
                                                        "use_filename",
                                                        true,
                                                        "unique_filename",
                                                        true,
                                                        "overwrite",
                                                        false));

                        String secureUrl = (String) uploadResult.get("secure_url");

                        if (secureUrl == null || secureUrl.isBlank()) {
                                throw new IllegalStateException(
                                                "Cloudinary không trả về URL ảnh");
                        }

                        List<ProductImage> existingImages = productImageRepository
                                        .findByProductIdOrderByDisplayOrderAsc(productId);

                        /*
                         * Nếu chưa có ảnh:
                         * - Ảnh đầu tiên sẽ là primary.
                         * - displayOrder bắt đầu từ 1.
                         */
                        boolean isPrimary = existingImages.isEmpty();

                        /*
                         * Tìm displayOrder lớn nhất hiện tại.
                         *
                         * Không dùng existingImages.size() + 1 vì dữ liệu cũ
                         * có thể đã bị hổng hoặc trùng thứ tự.
                         *
                         * Ví dụ:
                         * 1, 2, 3 -> ảnh mới = 4
                         * 1, 3 -> ảnh mới = 4
                         */
                        int maxDisplayOrder = existingImages.stream()
                                        .map(ProductImage::getDisplayOrder)
                                        .filter(order -> order != null)
                                        .max(Integer::compareTo)
                                        .orElse(0);

                        int displayOrder = maxDisplayOrder + 1;

                        ProductImage productImage = new ProductImage();

                        productImage.setProduct(product);
                        productImage.setImageUrl(secureUrl);
                        productImage.setPrimary(isPrimary);
                        productImage.setDisplayOrder(displayOrder);

                        ProductImage savedImage = productImageRepository.save(productImage);

                        return toResponse(savedImage);

                } catch (IOException e) {
                        throw new RuntimeException(
                                        "Không thể upload ảnh lên Cloudinary",
                                        e);
                }
        }

        /**
         * Lấy danh sách ảnh của Product.
         */
        public List<ProductImageResponse> getImagesByProduct(
                        Long productId) {
                if (!productRepository.existsById(productId)) {
                        throw new ResourceNotFoundException(
                                        "Không tìm thấy product với id: " + productId);
                }

                return productImageRepository
                                .findByProductIdOrderByDisplayOrderAsc(productId)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        /**
         * Xóa một ảnh của Product.
         *
         * Luồng xử lý:
         * 1. Kiểm tra Product.
         * 2. Kiểm tra Image.
         * 3. Đảm bảo Image thuộc đúng Product.
         * 4. Xóa file trên Cloudinary.
         * 5. Xóa record trong MySQL.
         * 6. Nếu ảnh bị xóa là ảnh primary,
         * chọn ảnh còn lại đầu tiên làm primary.
         */
        public void deleteImage(
                        Long productId,
                        Long imageId) {
                // Kiểm tra Product có tồn tại.
                if (!productRepository.existsById(productId)) {
                        throw new ResourceNotFoundException(
                                        "Không tìm thấy product với id: " + productId);
                }

                // Tìm Image.
                ProductImage productImage = productImageRepository.findById(imageId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy image với id: "
                                                                + imageId));

                // Không cho phép xóa image của Product khác.
                if (!productImage.getProduct().getId().equals(productId)) {
                        throw new ResourceNotFoundException(
                                        "Image không thuộc product này");
                }

                boolean wasPrimary = Boolean.TRUE.equals(
                                productImage.getPrimary());

                /*
                 * Lấy public_id từ URL Cloudinary.
                 *
                 * Ví dụ URL:
                 * https://res.cloudinary.com/dpof0uvuf/image/upload/v123456/
                 * sneaker-store/products/1/file_abc.jpg
                 *
                 * public_id cần truyền cho Cloudinary:
                 * sneaker-store/products/1/file_abc
                 */
                String publicId = extractPublicId(
                                productImage.getImageUrl());

                try {
                        /*
                         * Xóa file thật trên Cloudinary.
                         *
                         * resource_type=image:
                         * vì chúng ta đang lưu ảnh sản phẩm.
                         */
                        cloudinary.uploader().destroy(
                                        publicId,
                                        ObjectUtils.asMap(
                                                        "resource_type", "image",
                                                        "type", "upload"));

                } catch (IOException e) {
                        throw new RuntimeException(
                                        "Không thể xóa ảnh trên Cloudinary",
                                        e);
                }

                // Xóa record ảnh trong database.
                productImageRepository.delete(productImage);

                /*
                 * Nếu ảnh vừa xóa là primary,
                 * chọn ảnh đầu tiên còn lại làm primary.
                 */
                List<ProductImage> remainingImages = productImageRepository
                                .findByProductIdOrderByDisplayOrderAsc(productId);

                /*
                 * Sau khi xóa ảnh:
                 * - Đánh lại displayOrder từ 1, 2, 3...
                 * - Tránh trường hợp thứ tự bị hổng như 1, 3, 4...
                 */
                for (int i = 0; i < remainingImages.size(); i++) {
                        ProductImage image = remainingImages.get(i);

                        image.setDisplayOrder(i + 1);

                        /*
                         * Nếu ảnh vừa xóa là primary thì ảnh đầu tiên
                         * trong danh sách còn lại sẽ trở thành primary.
                         */
                        if (wasPrimary) {
                                image.setPrimary(i == 0);
                        }
                }

                if (!remainingImages.isEmpty()) {
                        productImageRepository.saveAll(remainingImages);
                }
        }

        /**
         * Lấy public_id của ảnh từ Cloudinary URL.
         */
        private String extractPublicId(String imageUrl) {

                if (imageUrl == null || imageUrl.isBlank()) {
                        throw new IllegalArgumentException(
                                        "Image URL không hợp lệ");
                }

                /*
                 * Tìm phần /upload/ trong URL.
                 */
                String uploadMarker = "/upload/";

                int uploadIndex = imageUrl.indexOf(uploadMarker);

                if (uploadIndex == -1) {
                        throw new IllegalArgumentException(
                                        "Không thể xác định Cloudinary public_id");
                }

                /*
                 * Lấy phần sau /upload/
                 */
                String publicIdWithVersion = imageUrl.substring(
                                uploadIndex + uploadMarker.length());

                /*
                 * Nếu URL có version:
                 *
                 * v1789555916/
                 * sneaker-store/products/1/file.jpg
                 *
                 * thì bỏ phần vXXXXXXXX/.
                 */
                if (publicIdWithVersion.startsWith("v")) {

                        int slashIndex = publicIdWithVersion.indexOf("/");

                        if (slashIndex != -1) {
                                String version = publicIdWithVersion.substring(
                                                1,
                                                slashIndex);

                                /*
                                 * Nếu phần sau v là số,
                                 * coi đó là version của Cloudinary.
                                 */
                                if (version.matches("\\d+")) {
                                        publicIdWithVersion = publicIdWithVersion.substring(
                                                        slashIndex + 1);
                                }
                        }
                }

                /*
                 * Bỏ extension .jpg / .png / .webp...
                 *
                 * Cloudinary destroy cần public_id không có extension.
                 */
                int lastDot = publicIdWithVersion.lastIndexOf(".");

                if (lastDot > publicIdWithVersion.lastIndexOf("/")) {
                        publicIdWithVersion = publicIdWithVersion.substring(
                                        0,
                                        lastDot);
                }

                return publicIdWithVersion;
        }

        /**
         * Chuyển Entity thành DTO.
         */
        private ProductImageResponse toResponse(
                        ProductImage productImage) {
                return new ProductImageResponse(
                                productImage.getId(),
                                productImage.getProduct().getId(),
                                productImage.getImageUrl(),
                                productImage.getPrimary(),
                                productImage.getDisplayOrder());
        }
}