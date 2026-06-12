package com.campusreuse.backend.repository;

import com.campusreuse.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Fetch all products that are AVAILABLE (for the marketplace)
    List<Product> findByStatusOrderByCreatedAtDesc(Product.Status status);

    // Fetch all products belonging to a specific seller
    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    // Basic search functionality (optional enhancement for later)
    @Query("SELECT p FROM Product p WHERE p.status = :status AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchAvailableProducts(@Param("query") String query, @Param("status") Product.Status status);
}
