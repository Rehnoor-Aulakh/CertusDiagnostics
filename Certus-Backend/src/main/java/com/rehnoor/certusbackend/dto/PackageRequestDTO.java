package com.rehnoor.certusbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class PackageRequestDTO {
    private Long packageId;
    private Long categoryId;
    private String name;
    private Integer numberOfTests;
    private BigDecimal price;
    private Boolean statusAvailable;
    private Integer displayOrder;
}
