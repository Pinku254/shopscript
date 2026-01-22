package com.shopscript.backend.controller;

import com.shopscript.backend.entity.Review;
import com.shopscript.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @PostMapping("/product/{productId}/user/{userId}")
    public Review addReview(@PathVariable Long productId, @PathVariable Long userId, @RequestBody Review review) {
        return reviewService.addReview(productId, userId, review);
    }

    @GetMapping("/product/{productId}")
    public List<Review> getProductReviews(@PathVariable Long productId) {
        return reviewService.getProductReviews(productId);
    }

    @GetMapping("/pending")
    public List<Review> getPendingReviews() {
        return reviewService.getPendingReviews();
    }

    @PutMapping("/{id}/approval")
    public Review approveReview(@PathVariable Long id, @RequestParam boolean approved) {
        return reviewService.approveReview(id, approved);
    }
}
