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
import com.sneakerstore.specification.ProductSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import com.sneakerstore.repository.SizeRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

        private final ProductRepository productRepository;
        private final BrandRepository brandRepository;
        private final CategoryRepository categoryRepository;
        private final SizeRepository sizeRepository;

        public ProductService(
                        ProductRepository productRepository,
                        BrandRepository brandRepository,
                        CategoryRepository categoryRepository,
                        SizeRepository sizeRepository) {
                this.productRepository = productRepository;
                this.brandRepository = brandRepository;
                this.categoryRepository = categoryRepository;
                this.sizeRepository = sizeRepository;
        }

        public ProductResponse createProduct(ProductCreateRequest request) {

                Brand brand = brandRepository.findById(request.getBrandId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy brand với id: "
                                                                + request.getBrandId()));

                Category category = categoryRepository.findById(
                                request.getCategoryId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy category với id: "
                                                                + request.getCategoryId()));

                Product product = new Product();

                product.setName(request.getName());
                product.setDescription(request.getDescription());
                product.setBasePrice(request.getBasePrice());
                product.setBrand(brand);
                product.setCategory(category);

                Product savedProduct = productRepository.save(product);

                return toResponse(savedProduct);
        }

        public List<ProductResponse> getAllProducts() {

                return productRepository.findAll()
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        /**
         * Tìm Product theo nhiều điều kiện.
         *
         * Có thể truyền null cho bất kỳ điều kiện nào.
         *
         * Ví dụ:
         * - keyword = "nike"
         * - brandId = 1
         * - sizeId = 3
         * - minPrice = 1000000
         * - maxPrice = 3000000
         *
         * Không có điều kiện nào -> trả về toàn bộ Product.
         */
        /**
         * Tìm kiếm Product theo nhiều điều kiện.
         */
        public List<ProductResponse> searchProducts(
                        String keyword,
                        Long brandId,
                        Long categoryId,
                        Long sizeId,
                        BigDecimal minPrice,
                        BigDecimal maxPrice) {

                /*
                 * Nếu client truyền brandId nhưng Brand không tồn tại
                 * thì trả 404.
                 */
                if (brandId != null && !brandRepository.existsById(brandId)) {
                        throw new ResourceNotFoundException(
                                        "Không tìm thấy brand với id: " + brandId);
                }

                /*
                 * Nếu client truyền categoryId nhưng Category không tồn tại
                 * thì trả 404.
                 */
                if (categoryId != null
                                && !categoryRepository.existsById(categoryId)) {

                        throw new ResourceNotFoundException(
                                        "Không tìm thấy category với id: " + categoryId);
                }

                /*
                 * Nếu client truyền sizeId nhưng Size không tồn tại
                 * thì trả 404.
                 */
                if (sizeId != null && !sizeRepository.existsById(sizeId)) {
                        throw new ResourceNotFoundException(
                                        "Không tìm thấy size với id: " + sizeId);
                }

                Specification<Product> specification = ProductSpecification.filter(
                                keyword,
                                brandId,
                                categoryId,
                                sizeId,
                                minPrice,
                                maxPrice);

                return productRepository.findAll(specification)
                                .stream()
                                .map(this::toResponse)
                                .toList();
        }

        public ProductResponse getProductById(Long id) {

                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy product với id: " + id));

                return toResponse(product);
        }

        public ProductResponse updateProduct(
                        Long id,
                        ProductUpdateRequest request) {

                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy product với id: " + id));

                Brand brand = brandRepository.findById(request.getBrandId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy brand với id: "
                                                                + request.getBrandId()));

                Category category = categoryRepository.findById(
                                request.getCategoryId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy category với id: "
                                                                + request.getCategoryId()));

                product.setName(request.getName());
                product.setDescription(request.getDescription());
                product.setBasePrice(request.getBasePrice());
                product.setBrand(brand);
                product.setCategory(category);

                Product updatedProduct = productRepository.save(product);

                return toResponse(updatedProduct);
        }

        public void deleteProduct(Long id) {

                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Không tìm thấy product với id: " + id));

                productRepository.delete(product);
        }

        private ProductResponse toResponse(Product product) {

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