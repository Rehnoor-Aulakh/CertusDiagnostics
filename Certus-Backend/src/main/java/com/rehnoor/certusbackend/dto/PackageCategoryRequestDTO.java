package com.rehnoor.certusbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PackageCategoryRequestDTO {
    private Long categoryId;
    private String name;
    private String imageUrl;
    private Boolean status;

}
