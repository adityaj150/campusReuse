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

    public ProductCacheService(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    /**
     * Get all available products, optionally filtered by a search query.
     * Cached under the "products" cache with the search term as key.
     */
    @Cacheable(value = "products", key = "#search != null ? #search : 'all'")
    public List<Product> getAvailableProducts(String search) {
        if (search != null && !search.trim().isEmpty()) {
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
