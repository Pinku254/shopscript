package com.shopscript.backend.repository;

import com.shopscript.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndIsApprovedTrue(Long productId);

    List<Review> findByIsApprovedFalse();
}
