package com.rehnoor.certusbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class PackageCategoryResponse {
    private Long categoryId;
    private String name;
    private Boolean statusAvailable;
    private String imageUrl;
    private Integer displayOrder;
}

