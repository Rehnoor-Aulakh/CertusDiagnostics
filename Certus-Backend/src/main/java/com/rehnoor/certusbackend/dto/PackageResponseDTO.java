package com.rehnoor.certusbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PackageResponseDTO {
    private Long packageId;
    private Long categoryId;
    private String name;
    private Integer numberOfTests;
    private String imageUrl;
    private BigDecimal price;
    private Integer displayOrder;
}
