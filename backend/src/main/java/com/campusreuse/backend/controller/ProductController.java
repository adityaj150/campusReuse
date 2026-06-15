package com.campusreuse.backend.controller;

import com.campusreuse.backend.model.Product;
import com.campusreuse.backend.model.User;
import com.campusreuse.backend.repository.ProductRepository;
import com.campusreuse.backend.repository.UserRepository;
import com.campusreuse.backend.security.JwtUtil;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final com.campusreuse.backend.service.RecommendationService recommendationService;

    public ProductController(ProductRepository productRepo, UserRepository userRepo, JwtUtil jwtUtil, com.campusreuse.backend.service.RecommendationService recommendationService) {
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.recommendationService = recommendationService;
    }

    // ================= DTOs =================

    @Getter @Setter
    static class ProductRequest {
        private String title;
        private String description;
        private String category;
        private Double price;
        private String condition;
        private String imageUrl;
    }

    @Getter @Setter
    static class StatusUpdateRequest {
        private String status;
    }

    // Helper to get authenticated user
    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        return userRepo.findByEmail(email).orElse(null);
    }

    // ================= Endpoints =================

    @GetMapping
    public ResponseEntity<List<Product>> getAvailableProducts(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(productRepo.searchAvailableProducts(search, Product.Status.AVAILABLE));
        }
        return ResponseEntity.ok(productRepo.findByStatusOrderByCreatedAtDesc(Product.Status.AVAILABLE));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Long id) {
        return productRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyProducts(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(productRepo.findBySellerIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestHeader("Authorization") String authHeader,
                                           @RequestBody ProductRequest req) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = Product.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .price(req.getPrice())
                .condition(Product.Condition.valueOf(req.getCondition()))
                .status(Product.Status.AVAILABLE)
                .seller(user)
                .imageUrl(req.getImageUrl())
                .build();

        productRepo.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                           @RequestHeader("Authorization") String authHeader,
                                           @RequestBody ProductRequest req) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(id).orElse(null);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        if (!product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not your product"));
        }

        product.setTitle(req.getTitle());
        product.setDescription(req.getDescription());
        product.setCategory(req.getCategory());
        product.setPrice(req.getPrice());
        product.setCondition(Product.Condition.valueOf(req.getCondition()));
        product.setImageUrl(req.getImageUrl());

        productRepo.save(product);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestHeader("Authorization") String authHeader,
                                          @RequestBody StatusUpdateRequest req) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(id).orElse(null);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        if (!product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not your product"));
        }

        try {
            product.setStatus(Product.Status.valueOf(req.getStatus().toUpperCase()));
            productRepo.save(product);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
        }
    }

    // ================= Recommendation Endpoints =================

    @PostMapping("/{id}/view")
    public ResponseEntity<?> logProductView(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(id).orElse(null);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        recommendationService.logProductView(user, product);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/recommendations")
    public ResponseEntity<?> getRecommendations(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Product> recommendations = recommendationService.getRecommendations(user, 3);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/me/recently-viewed")
    public ResponseEntity<?> getRecentlyViewed(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Product> recentlyViewed = recommendationService.getRecentlyViewed(user.getId());
        return ResponseEntity.ok(recentlyViewed);
    }
}
