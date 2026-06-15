package com.campusreuse.backend.service;

import com.campusreuse.backend.model.Product;
import com.campusreuse.backend.model.ProductView;
import com.campusreuse.backend.model.User;
import com.campusreuse.backend.repository.ProductRepository;
import com.campusreuse.backend.repository.ProductViewRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final ProductViewRepository productViewRepository;
    private final ProductRepository productRepository;

    public RecommendationService(ProductViewRepository productViewRepository, ProductRepository productRepository) {
        this.productViewRepository = productViewRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void logProductView(User user, Product product) {
        Optional<ProductView> existingView = productViewRepository.findByUserAndProduct(user, product);
        if (existingView.isPresent()) {
            ProductView view = existingView.get();
            view.setViewedAt(LocalDateTime.now());
            productViewRepository.save(view);
        } else {
            ProductView view = new ProductView(user, product);
            productViewRepository.save(view);
        }
    }

    public List<Product> getRecentlyViewed(Long userId) {
        return productViewRepository.findRecentlyViewedProductsByUser(userId, PageRequest.of(0, 10));
    }

    /**
     * Item-Based Collaborative Filtering using Cosine Similarity.
     */
    public List<Product> getRecommendations(User user, int limit) {
        List<Long> viewedProductIds = productViewRepository.findProductIdsByUserId(user.getId());
        
        // If the user hasn't viewed anything, return empty list (or fallback to popular items)
        if (viewedProductIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Fetch all product views to build the user-item interaction matrix in memory
        List<ProductView> allViews = productViewRepository.findAll();
        
        // Map: ProductId -> Set of UserIds who viewed it
        Map<Long, Set<Long>> productToUsersMap = new HashMap<>();
        for (ProductView pv : allViews) {
            productToUsersMap
                .computeIfAbsent(pv.getProduct().getId(), k -> new HashSet<>())
                .add(pv.getUser().getId());
        }

        Map<Long, Double> productScores = new HashMap<>();
        List<Product> allProducts = productRepository.findAll();

        for (Product targetProduct : allProducts) {
            Long targetId = targetProduct.getId();
            
            // Skip products the user has already viewed or created
            if (viewedProductIds.contains(targetId) || targetProduct.getSeller().getId().equals(user.getId())) {
                continue;
            }

            Set<Long> targetUsers = productToUsersMap.getOrDefault(targetId, Collections.emptySet());
            if (targetUsers.isEmpty()) continue; // No one has viewed this product yet

            double totalScore = 0.0;

            // Calculate cosine similarity against all products the user HAS viewed
            for (Long viewedId : viewedProductIds) {
                Set<Long> viewedUsers = productToUsersMap.getOrDefault(viewedId, Collections.emptySet());
                
                if (viewedUsers.isEmpty()) continue;

                // Intersection: Users who viewed both
                Set<Long> intersection = new HashSet<>(targetUsers);
                intersection.retainAll(viewedUsers);

                if (intersection.isEmpty()) continue;

                // Cosine Similarity Formula: DotProduct / (||A|| * ||B||)
                // DotProduct = intersection size (since binary vectors)
                double dotProduct = intersection.size();
                double magnitudeA = Math.sqrt(targetUsers.size());
                double magnitudeB = Math.sqrt(viewedUsers.size());
                
                double similarity = dotProduct / (magnitudeA * magnitudeB);
                totalScore += similarity;
            }

            if (totalScore > 0) {
                productScores.put(targetId, totalScore);
            }
        }

        // Sort by score descending and take top N
        List<Long> recommendedIds = productScores.entrySet().stream()
            .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
            .limit(limit)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());

        // Fetch products and maintain sorted order
        List<Product> recommendations = new ArrayList<>();
        for (Long id : recommendedIds) {
            productRepository.findById(id).ifPresent(recommendations::add);
        }

        return recommendations;
    }
}
