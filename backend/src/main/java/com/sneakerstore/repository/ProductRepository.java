package com.sneakerstore.repository;

import com.sneakerstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

public interface ProductRepository
        extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    Optional<Product> findByName(String name);

    boolean existsByName(String name);

    /**
     * Lấy product kèm brand + category.
     * Variant load riêng để tránh MultipleBagFetchException.
     */
    @Query("""
            SELECT DISTINCT p FROM Product p
            JOIN FETCH p.brand
            JOIN FETCH p.category
            ORDER BY p.id ASC
            """)
    List<Product> findAllWithBrandAndCategory();

    @Query("""
        SELECT DISTINCT p FROM Product p
        JOIN FETCH p.brand
        JOIN FETCH p.category
        WHERE p.id IN :ids
        """)
    List<Product> findByIdInWithBrandAndCategory(@Param("ids") Collection<Long> ids);
}