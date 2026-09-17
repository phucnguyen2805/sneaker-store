package com.sneakerstore.specification;

import com.sneakerstore.entity.Product;
import com.sneakerstore.entity.ProductVariant;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    private ProductSpecification() {
        // Không cho phép tạo object từ class Specification.
    }

    /**
     * Tìm kiếm và lọc Product.
     *
     * Các điều kiện đều có thể truyền null.
     *
     * keyword:
     * - Tìm trong tên Product
     * - Tìm trong mô tả Product
     *
     * brandId:
     * - Lọc theo Brand
     *
     * categoryId:
     * - Lọc theo Category
     *
     * sizeId:
     * - JOIN từ Product -> ProductVariant -> Size
     *
     * minPrice / maxPrice:
     * - Lọc theo basePrice của Product
     */
    public static Specification<Product> filter(
            String keyword,
            Long brandId,
            Long categoryId,
            Long sizeId,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            /*
             * ---------------------------------------------------------
             * 1. Tìm kiếm theo keyword
             * ---------------------------------------------------------
             *
             * lower() giúp việc tìm kiếm không phân biệt chữ hoa/chữ thường.
             *
             * Ví dụ:
             * keyword = "nike"
             *
             * sẽ tìm được:
             * "Nike Air Force 1"
             * "NIKE Dunk Low"
             */
            if (keyword != null && !keyword.trim().isEmpty()) {

                String searchKeyword = "%" + keyword.trim().toLowerCase() + "%";

                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        searchKeyword);

                Predicate descriptionPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(
                                root.get("description")),
                        searchKeyword);

                predicates.add(
                        criteriaBuilder.or(
                                namePredicate,
                                descriptionPredicate));
            }

            /*
             * ---------------------------------------------------------
             * 2. Lọc theo Brand
             * ---------------------------------------------------------
             */
            if (brandId != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("brand").get("id"),
                                brandId));
            }

            /*
             * ---------------------------------------------------------
             * 3. Lọc theo Category
             * ---------------------------------------------------------
             */
            if (categoryId != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("category").get("id"),
                                categoryId));
            }

            /*
             * ---------------------------------------------------------
             * 4. Lọc theo Size
             * ---------------------------------------------------------
             *
             * Product không có Size trực tiếp.
             *
             * Quan hệ:
             *
             * Product
             * |
             * +---- ProductVariant
             * |
             * +---- Size
             *
             * Vì vậy ta JOIN:
             *
             * Product -> ProductVariant -> Size
             */
            if (sizeId != null) {

                Join<Product, ProductVariant> variantJoin = root.join(
                        "variants",
                        JoinType.INNER);

                predicates.add(
                        criteriaBuilder.equal(
                                variantJoin.get("size").get("id"),
                                sizeId));

                /*
                 * Khi JOIN nhiều variant, một Product có thể xuất hiện
                 * nhiều lần trong kết quả SQL.
                 *
                 * distinct(true) giúp mỗi Product chỉ xuất hiện một lần.
                 */
                query.distinct(true);
            }

            /*
             * ---------------------------------------------------------
             * 5. Giá tối thiểu
             * ---------------------------------------------------------
             */
            if (minPrice != null) {

                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("basePrice"),
                                minPrice));
            }

            /*
             * ---------------------------------------------------------
             * 6. Giá tối đa
             * ---------------------------------------------------------
             */
            if (maxPrice != null) {

                predicates.add(
                        criteriaBuilder.lessThanOrEqualTo(
                                root.get("basePrice"),
                                maxPrice));
            }

            /*
             * Nếu không có điều kiện nào:
             *
             * WHERE 1 = 1
             *
             * => trả về toàn bộ Product.
             */
            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0]));
        };
    }
}