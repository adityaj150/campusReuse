package com.campusreuse.backend.service;

import com.campusreuse.backend.model.Product;
import com.campusreuse.backend.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Dedicated caching layer for Product data.
 *
 * This service sits between the controller and the repository.
 * It caches raw Product / List<Product> objects — NOT ResponseEntity —
 * so that Redis serialization works correctly.
 */
@Service
public class ProductCacheService {

    private final ProductRepository productRepo;
    private final NlpClientService nlpClientService;

    public ProductCacheService(ProductRepository productRepo, NlpClientService nlpClientService) {
        this.productRepo = productRepo;
        this.nlpClientService = nlpClientService;
    }

    /**
     * Get all available products, optionally filtered by a search query.
     * Cached under the "products" cache with the search term as key.
     */
    @Cacheable(value = "products", key = "#search != null ? #search : 'all'")
    public List<Product> getAvailableProducts(String search) {
        if (search != null && !search.trim().isEmpty()) {
            List<Long> semanticIds = nlpClientService.searchProducts(search, 10);
            if (semanticIds != null && !semanticIds.isEmpty()) {
                List<Product> products = productRepo.findAllById(semanticIds);
                // Sort products to match the semantic relevance order returned by the NLP service
                return semanticIds.stream()
                        .map(id -> products.stream()
                                .filter(p -> p.getId().equals(id) && p.getStatus() == Product.Status.AVAILABLE)
                                .findFirst().orElse(null))
                        .filter(java.util.Objects::nonNull)
                        .collect(java.util.stream.Collectors.toList());
            }
            // Fallback to standard substring search if NLP service returns no results or fails
            return productRepo.searchAvailableProducts(search, Product.Status.AVAILABLE);
        }
        return productRepo.findByStatusOrderByCreatedAtDesc(Product.Status.AVAILABLE);
    }

    /**
     * Get a single product by ID.
     * Cached under the "product" cache with the product ID as key.
     */
    @Cacheable(value = "product", key = "#id")
    public Product getProductById(Long id) {
        return productRepo.findById(id).orElse(null);
    }

    /**
     * Evict all product-related caches.
     * Call this after any create, update, or delete operation.
     */
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "product", allEntries = true)
    })
    public void evictProductCaches() {
        // This method intentionally has no body.
        // The @CacheEvict annotations handle the cache clearing.
    }
}
