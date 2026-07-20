package com.rehnoor.certusbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;

@Entity
@Table(name="google_reviews")
@Getter
@Setter
@NoArgsConstructor
public class GoogleReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String author;

    private Float rating;

    @Column(name = "review_text", columnDefinition = "text")
    private String reviewText;

    @Column(name = "review_time")
    private ZonedDateTime reviewTime;
}
