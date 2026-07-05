package com.campusreuse.backend.repository;

import com.campusreuse.backend.model.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    // For Buyer: Get all inquiries they have sent
    List<Inquiry> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    // For Seller: Get all inquiries they have received for their products
    List<Inquiry> findByProductSellerIdOrderByCreatedAtDesc(Long sellerId);
    
    // Check if an inquiry already exists for a buyer and product
    boolean existsByBuyerIdAndProductId(Long buyerId, Long productId);

    void deleteByProductId(Long productId);
}
