package com.campusreuse.backend.controller;

import com.campusreuse.backend.model.Product;
import com.campusreuse.backend.model.SavedItem;
import com.campusreuse.backend.model.User;
import com.campusreuse.backend.repository.ProductRepository;
import com.campusreuse.backend.repository.SavedItemRepository;
import com.campusreuse.backend.repository.UserRepository;
import com.campusreuse.backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved")
public class SavedItemController {

    private final SavedItemRepository savedItemRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public SavedItemController(SavedItemRepository savedItemRepo, ProductRepository productRepo, UserRepository userRepo, JwtUtil jwtUtil) {
        this.savedItemRepo = savedItemRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        return userRepo.findByEmail(email).orElse(null);
    }

    // Toggle save/unsave a product (like/unlike)
    @PostMapping("/toggle/{productId}")
    @Transactional
    public ResponseEntity<?> toggleSave(@PathVariable Long productId, @RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(productId).orElse(null);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Product not found"));

        boolean alreadySaved = savedItemRepo.existsByUserIdAndProductId(user.getId(), productId);

        if (alreadySaved) {
            savedItemRepo.deleteByUserIdAndProductId(user.getId(), productId);
            return ResponseEntity.ok(Map.of("saved", false, "message", "Removed from liked items"));
        } else {
            SavedItem item = SavedItem.builder()
                    .user(user)
                    .product(product)
                    .build();
            savedItemRepo.save(item);
            return ResponseEntity.ok(Map.of("saved", true, "message", "Added to liked items"));
        }
    }

    // Get all saved/liked products for the authenticated user
    @GetMapping
    public ResponseEntity<?> getSavedItems(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Product> products = savedItemRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(SavedItem::getProduct)
                .collect(Collectors.toList());

        return ResponseEntity.ok(products);
    }

    // Check if a specific product is saved by the user
    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkSaved(@PathVariable Long productId, @RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean saved = savedItemRepo.existsByUserIdAndProductId(user.getId(), productId);
        return ResponseEntity.ok(Map.of("saved", saved));
    }

    // Get IDs of all saved products (for bulk checking on listing pages)
    @GetMapping("/ids")
    public ResponseEntity<?> getSavedProductIds(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<Long> ids = savedItemRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(item -> item.getProduct().getId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ids);
    }
}
