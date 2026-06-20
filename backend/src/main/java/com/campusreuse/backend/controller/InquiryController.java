package com.campusreuse.backend.controller;

import com.campusreuse.backend.model.Inquiry;
import com.campusreuse.backend.model.Product;
import com.campusreuse.backend.model.User;
import com.campusreuse.backend.repository.InquiryRepository;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    private final InquiryRepository inquiryRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final com.campusreuse.backend.service.EmailService emailService;

    public InquiryController(InquiryRepository inquiryRepo, ProductRepository productRepo, UserRepository userRepo, JwtUtil jwtUtil, com.campusreuse.backend.service.EmailService emailService) {
        this.inquiryRepo = inquiryRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // Helper to get authenticated user
    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        return userRepo.findByEmail(email).orElse(null);
    }

    // ================= DTOs =================

    @Getter @Setter
    static class RespondRequest {
        private String action; // "SHARE_EMAIL", "SHARE_PHONE", "REJECT"
        private String phoneNumber; // Optional, if they are sharing phone
    }

    @Getter @AllArgsConstructor
    static class InquiryDto {
        private Long id;
        private Long productId;
        private String productTitle;
        private String status;
        private String sellerName;
        private String buyerName;
        // Contact info is only populated depending on status and role
        private String contactEmail;
        private String contactPhone;
    }

    // Convert entity to DTO, hiding contact info based on status
    private InquiryDto toDto(Inquiry inq, User currentUser) {
        boolean isBuyer = inq.getBuyer().getId().equals(currentUser.getId());
        boolean isSeller = inq.getProduct().getSeller().getId().equals(currentUser.getId());

        String email = null;
        String phone = null;

        if (isBuyer) {
            if (inq.getStatus() == Inquiry.Status.SHARED_EMAIL) {
                email = inq.getProduct().getSeller().getEmail();
            } else if (inq.getStatus() == Inquiry.Status.SHARED_PHONE) {
                phone = inq.getProduct().getSeller().getPhoneNumber();
            }
        } else if (isSeller) {
            // Seller can always see buyer's name
            email = inq.getBuyer().getEmail();
        }

        return new InquiryDto(
                inq.getId(),
                inq.getProduct().getId(),
                inq.getProduct().getTitle(),
                inq.getStatus().name(),
                inq.getProduct().getSeller().getName(),
                inq.getBuyer().getName(),
                email,
                phone
        );
    }

    // ================= Endpoints =================

    @PostMapping("/product/{productId}")
    public ResponseEntity<?> createInquiry(@PathVariable Long productId, @RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Product product = productRepo.findById(productId).orElse(null);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Product not found"));

        if (product.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot inquire about your own product"));
        }

        if (inquiryRepo.existsByBuyerIdAndProductId(user.getId(), productId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You have already sent an inquiry for this product"));
        }

        Inquiry inquiry = Inquiry.builder()
                .product(product)
                .buyer(user)
                .status(Inquiry.Status.PENDING)
                .build();
        inquiryRepo.save(inquiry);

        // Send email notification to the seller
        emailService.sendInterestNotification(inquiry);

        return ResponseEntity.ok(toDto(inquiry, user));
    }

    @GetMapping("/sent")
    public ResponseEntity<?> getSentInquiries(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<InquiryDto> dtos = inquiryRepo.findByBuyerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(inq -> toDto(inq, user)).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/received")
    public ResponseEntity<?> getReceivedInquiries(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        List<InquiryDto> dtos = inquiryRepo.findByProductSellerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(inq -> toDto(inq, user)).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<?> respondToInquiry(@PathVariable Long id, 
                                              @RequestHeader("Authorization") String authHeader,
                                              @RequestBody RespondRequest req) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Inquiry inquiry = inquiryRepo.findById(id).orElse(null);
        if (inquiry == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        if (!inquiry.getProduct().getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not your inquiry"));
        }

        if ("SHARE_EMAIL".equals(req.getAction())) {
            inquiry.setStatus(Inquiry.Status.SHARED_EMAIL);
        } else if ("SHARE_PHONE".equals(req.getAction())) {
            if (req.getPhoneNumber() != null && !req.getPhoneNumber().isEmpty()) {
                user.setPhoneNumber(req.getPhoneNumber());
                userRepo.save(user);
            }
            inquiry.setStatus(Inquiry.Status.SHARED_PHONE);
        } else if ("REJECT".equals(req.getAction())) {
            inquiry.setStatus(Inquiry.Status.REJECTED);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid action"));
        }

        inquiryRepo.save(inquiry);
        return ResponseEntity.ok(toDto(inquiry, user));
    }
}
