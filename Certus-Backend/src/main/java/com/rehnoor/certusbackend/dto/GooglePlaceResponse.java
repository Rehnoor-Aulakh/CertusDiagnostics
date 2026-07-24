package com.rehnoor.certusbackend.dto;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record GooglePlaceResponse(Result result, String status) {
    public record Result(List<Review> reviews){};

    public record Review(
            @JsonProperty("author_name") String authorName,
            Float rating,
            String text,
            Long time
    ) {}
}
