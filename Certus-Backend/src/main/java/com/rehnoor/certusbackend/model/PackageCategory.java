package com.rehnoor.certusbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;

@Table(name = "package_categories")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PackageCategory {
    @Id
    @Column(name="category_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(length = 100)
    private String name;

    @Column(name="status_available", nullable = false)
    private Boolean statusAvailable = true;

    @Column(name="image_url")
    private String imageUrl;

    @Column(name="created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name="updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @Column(name="display_order", nullable = false)
    private Integer displayOrder;

    @PrePersist
    public void prePersist() {
        createdAt = ZonedDateTime.now();
        updatedAt = ZonedDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = ZonedDateTime.now();
    }


}
