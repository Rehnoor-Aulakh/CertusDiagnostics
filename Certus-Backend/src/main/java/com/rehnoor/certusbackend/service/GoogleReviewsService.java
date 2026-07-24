package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.GooglePlaceResponse;
import com.rehnoor.certusbackend.model.GoogleReview;
import com.rehnoor.certusbackend.repository.GoogleReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.net.URI;

@Service
public class GoogleReviewsService {
    private static final Logger log = LoggerFactory.getLogger(GoogleReviewsService.class);

    // fetch the api keys from application.properties
    @Value("${google.api.key}")
    private String apiKey;

    @Value("${google.api.place-id}")
    private String placeId;

    @Value("${google.api.max-reviews:5}")
    private int maxReviews;

    @Value("${google.api.fetching.enabled:false}")
    private boolean isFetchingEnabled;

    @Value("${app.timezone:Asia/Kolkata}")
    private String configuredTimezone;

    private final GoogleReviewRepository reviewRepository;

    private final RestClient restClient;

    public GoogleReviewsService(GoogleReviewRepository reviewRepository){
        this.reviewRepository = reviewRepository;
        this.restClient= RestClient.create();
    }

    // Scheduled job running daily at 9:00 AM IST

//    @Scheduled(cron="0 0 13 * * *", zone="Asia/Kolkata")
    public int fetchAndSaveReviews() {
        if (!isFetchingEnabled) {
            System.out.println("Google Reviews fetch process is disabled via configuration.");
            return 0;
        }
        log.info("Starting Google Reviews fetch process...");

        if("ENTER_GOOGLE_API_KEY".equals(apiKey) || "ENTER_PLACE_ID".equals(placeId)){
            log.error("Google API Key or Place ID is not configured correctly");
            return 0;
        }
        String url = UriComponentsBuilder
                .fromUri(URI.create("https://maps.googleapis.com/maps/api/place/details/json"))
                .queryParam("place_id", placeId)
                .queryParam("fields", "reviews,rating,user_ratings_total")
                .queryParam("key",apiKey)
                .queryParam("language","en")
                .queryParam("reviews_sort","newest")
                .toUriString();

        try{
            GooglePlaceResponse response = restClient.get().uri(url)
                    .header("User-Agent", "Certus Diagnostics Reviews Fetcher/1.0")
                    .retrieve()
                    .body(GooglePlaceResponse.class);
            if(response==null || !"OK".equalsIgnoreCase(response.status())) {
                log.error("Google Places API returned status: {}", response!=null ? response.status() : "NULL");
                return 0;
            }
            if (response.result() == null || response.result().reviews() == null) {
                log.info("No reviews returned from Google Places API.");
                return 0;
            }
            List<GooglePlaceResponse.Review> reviews = response.result().reviews();
            int newCount = 0;

            for(GooglePlaceResponse.Review review: reviews){
                if(processAndSave(review)){
                    newCount++;
                }
            }
            log.info("Fetch process completed. Added {} new reviews.", newCount);
            return newCount;
        } catch (Exception e) {
            log.error("An error occurred while fetching Google Reviews: {}", e.getMessage(), e);
            return 0;
        }
    }
    private boolean processAndSave(GooglePlaceResponse.Review reviewData){
        String author = reviewData.authorName() !=null ? reviewData.authorName() : "Anonymous";
        Float rating = reviewData.rating() != null ? reviewData.rating() : 0.0f;
        String text = reviewData.text() != null ? reviewData.text() : "";
        ZoneId zoneId = ZoneId.of(configuredTimezone);
        ZonedDateTime reviewTime = reviewData.time() != null
                ? Instant.ofEpochSecond(reviewData.time()).atZone(zoneId)
                : ZonedDateTime.now(zoneId);
        if (rating < 1.0f || rating > 5.0f) {
            log.warn("Skipping invalid review rating from author: {}", author);
            return false;
        }
        if (reviewRepository.existsByAuthorAndReviewTextAndReviewTime(author, text, reviewTime)) {
            log.info("Review by '{}' already exists - skipping.", author);
            return false;
        }
        GoogleReview review = new GoogleReview();
        review.setReviewText(text);
        review.setReviewTime(reviewTime);
        review.setAuthor(author);
        review.setRating(rating);

        reviewRepository.save(review);
        log.info("Successfully stored review by '{}' (Rating: {})", author, rating);
        return true;
    }
}
