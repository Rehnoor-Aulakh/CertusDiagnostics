package com.rehnoor.certusbackend.controller.viewer;

import com.rehnoor.certusbackend.model.GoogleReview;
import com.rehnoor.certusbackend.repository.GoogleReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController("viewerDashboardController")
@RequestMapping("/api/v1/viewer")
public class DashboardController {
    @Autowired
    private GoogleReviewRepository reviewRepository;

    @GetMapping("/fetchReviews")
    public ResponseEntity<?> getReviews(){
        List<GoogleReview> reviews = reviewRepository.findAllByOrderByRatingDesc();
        double avgRating = reviews.stream().mapToDouble(GoogleReview::getRating).average().orElse(5.0);
        return ResponseEntity.ok(Map.of("success",true,"data",reviews, "stats", Map.of("total_reviews", reviews.size(),"average_rating",avgRating)));
    }

}
