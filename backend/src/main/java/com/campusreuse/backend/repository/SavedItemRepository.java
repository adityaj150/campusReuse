package com.campusreuse.backend.repository;

import com.campusreuse.backend.model.SavedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedItemRepository extends JpaRepository<SavedItem, Long> {
    List<SavedItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<SavedItem> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
    
    void deleteByProductId(Long productId);

    @Query("SELECT s.product.id FROM SavedItem s WHERE s.user.id = :userId")
    List<Long> findProductIdsByUserId(Long userId);
}
