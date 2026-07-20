package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.model.GoogleReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoogleReviewRepository extends JpaRepository<GoogleReview, Long> {
    // Fetch reviews sorted by highest rating first
    List<GoogleReview> findAllByOrderByRatingDesc();
}
