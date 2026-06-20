package com.campusreuse.backend.repository;

import com.campusreuse.backend.model.SavedItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedItemRepository extends JpaRepository<SavedItem, Long> {
    List<SavedItem> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<SavedItem> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);
    List<Long> findProductIdsByUserId(Long userId);
}
