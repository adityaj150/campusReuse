package com.campusreuse.backend.controller;

import com.campusreuse.backend.model.Product;
import com.campusreuse.backend.model.User;
import com.campusreuse.backend.repository.ProductRepository;
import com.campusreuse.backend.repository.InquiryRepository;
import com.campusreuse.backend.repository.ProductViewRepository;
import com.campusreuse.backend.repository.SavedItemRepository;
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
    private final InquiryRepository inquiryRepo;
    private final ProductViewRepository productViewRepo;
    private final SavedItemRepository savedItemRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final com.campusreuse.backend.service.RecommendationService recommendationService;
    private final com.campusreuse.backend.service.S3Service s3Service;
    private final com.campusreuse.backend.service.ProductCacheService productCacheService;
    private final com.campusreuse.backend.service.NlpClientService nlpClientService;
    private final com.campusreuse.backend.service.EmailService emailService;

    public ProductController(ProductRepository productRepo, 
            InquiryRepository inquiryRepo,
            ProductViewRepository productViewRepo,
            SavedItemRepository savedItemRepo,
            UserRepository userRepo, JwtUtil jwtUtil,
            com.campusreuse.backend.service.RecommendationService recommendationService,
            com.campusreuse.backend.service.S3Service s3Service,
            com.campusreuse.backend.service.ProductCacheService productCacheService,
            com.campusreuse.backend.service.NlpClientService nlpClientService,
            com.campusreuse.backend.service.EmailService emailService) {
        this.productRepo = productRepo;
        this.inquiryRepo = inquiryRepo;
        this.productViewRepo = productViewRepo;
        this.savedItemRepo = savedItemRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.recommendationService = recommendationService;
        this.s3Service = s3Service;
        this.productCacheService = productCacheService;
        this.nlpClientService = nlpClientService;
        this.emailService = emailService;
    }

    // ================= DTOs =================

    @Getter
    @Setter
    static class StatusUpdateRequest {
        private String status;
    }

    // Helper to get authenticated user
    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        return userRepo.findByEmail(email).orElse(null);
    }

    // ================= Endpoints =================

    @GetMapping
    public ResponseEntity<List<Product>> getAvailableProducts(
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(productCacheService.getAvailableProducts(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Long id) {
        Product product = productCacheService.getProductById(id);
        if (product == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(product);
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyProducts(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(productRepo.findBySellerIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestHeader("Authorization") String authHeader,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("price") Double price,
            @RequestParam("condition") String condition,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            try {
                imageUrl = s3Service.uploadImage(image);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Image upload failed: " + e.getMessage()));
            }
        }

        Product product = Product.builder()
                .title(title)
                .description(description)
                .category(category)
                .price(price)
                .condition(Product.Condition.valueOf(condition))
                .status(Product.Status.AVAILABLE)
                .seller(user)
                .imageUrl(imageUrl)
                .build();

        productRepo.save(product);
        productCacheService.evictProductCaches();
        nlpClientService.indexProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("price") Double price,
            @RequestParam("condition") String condition,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(id).orElse(null);
        if (product == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        if (!product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not your product"));
        }

        if (image != null && !image.isEmpty()) {
            try {
                product.setImageUrl(s3Service.uploadImage(image));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Image upload failed: " + e.getMessage()));
            }
        }

        product.setTitle(title);
        product.setDescription(description);
        product.setCategory(category);
        product.setPrice(price);
        product.setCondition(Product.Condition.valueOf(condition));

        productRepo.save(product);
        productCacheService.evictProductCaches();
        nlpClientService.indexProduct(product);
        return ResponseEntity.ok(product);
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(id).orElse(null);
        if (product == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        boolean isSeller = product.getSeller().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;

        if (!isSeller && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized to delete this product"));
        }

        // Send email if deleted by admin (and admin is not the seller)
        if (isAdmin && !isSeller) {
            emailService.sendAdminDeletionNotification(product);
        }

        // 1. Delete image from S3 if exists
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            s3Service.deleteImage(product.getImageUrl());
        }

        // 2. Delete related records to prevent foreign key constraint violations
        inquiryRepo.deleteByProductId(id);
        productViewRepo.deleteByProductId(id);
        savedItemRepo.deleteByProductId(id);

        // 3. Delete product from DB
        productRepo.delete(product);

        // 4. Clear cache & NLP index
        productCacheService.evictProductCaches();
        nlpClientService.deleteProduct(id);

        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody StatusUpdateRequest req) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(id).orElse(null);
        if (product == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        if (!product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not your product"));
        }

        try {
            product.setStatus(Product.Status.valueOf(req.getStatus().toUpperCase()));
            productRepo.save(product);
            productCacheService.evictProductCaches();
            nlpClientService.indexProduct(product);
            return ResponseEntity.ok(product);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
        }
    }

    // ================= Recommendation Endpoints =================

    @PostMapping("/{id}/view")
    public ResponseEntity<?> logProductView(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(id).orElse(null);
        if (product == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        recommendationService.logProductView(user, product);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/recommendations")
    public ResponseEntity<?> getRecommendations(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Product> recommendations = recommendationService.getRecommendations(user, 3);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/me/recently-viewed")
    public ResponseEntity<?> getRecentlyViewed(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Product> recentlyViewed = recommendationService.getRecentlyViewed(user.getId());
        return ResponseEntity.ok(recentlyViewed);
    }
}
