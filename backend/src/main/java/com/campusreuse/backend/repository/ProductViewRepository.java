package com.campusreuse.backend.repository;

import com.campusreuse.backend.model.Product;
import com.campusreuse.backend.model.ProductView;
import com.campusreuse.backend.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductViewRepository extends JpaRepository<ProductView, Long> {
    
    Optional<ProductView> findByUserAndProduct(User user, Product product);

    // Get a user's recently viewed products, ordered by most recent first
    @Query("SELECT pv.product FROM ProductView pv WHERE pv.user.id = :userId ORDER BY pv.viewedAt DESC")
    List<Product> findRecentlyViewedProductsByUser(Long userId, Pageable pageable);

    // Find all users who viewed a specific product
    @Query("SELECT pv.user.id FROM ProductView pv WHERE pv.product.id = :productId")
    List<Long> findUserIdsByProductId(Long productId);

    // Find all products viewed by a specific user
    @Query("SELECT pv.product.id FROM ProductView pv WHERE pv.user.id = :userId")
    List<Long> findProductIdsByUserId(Long userId);
}
