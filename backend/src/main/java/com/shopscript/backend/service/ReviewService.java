package com.shopscript.backend.service;

import com.shopscript.backend.entity.Product;
import com.shopscript.backend.entity.Review;
import com.shopscript.backend.entity.User;
import com.shopscript.backend.repository.ProductRepository;
import com.shopscript.backend.repository.ReviewRepository;
import com.shopscript.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Review addReview(Long productId, Long userId, Review review) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        review.setProduct(product);
        review.setUser(user);
        review.setApproved(false); // Default to not approved
        return reviewRepository.save(review);
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndIsApprovedTrue(productId);
    }

    public List<Review> getPendingReviews() {
        return reviewRepository.findByIsApprovedFalse();
    }

    public Review approveReview(Long id, boolean approved) {
        Review review = reviewRepository.findById(id).orElseThrow(() -> new RuntimeException("Review not found"));
        review.setApproved(approved);
        return reviewRepository.save(review);
    }
}
