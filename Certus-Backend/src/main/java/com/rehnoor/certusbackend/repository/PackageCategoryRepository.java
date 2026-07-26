package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.model.PackageCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageCategoryRepository extends JpaRepository<PackageCategory,Long> {
    // inherits basic CRUD Operations
    List<PackageCategory> findByStatusAvailableTrue();

    Optional<PackageCategory> findByCategoryIdAndStatusAvailableTrue(Long categoryId);

    boolean existsByNameIgnoreCase(String name);

    List<PackageCategory> findAllByOrderByStatusAvailableDescUpdatedAtDesc();

    PackageCategory getPackageCategoryByCategoryId(Long id);

    List<PackageCategory> findAllByStatusAvailableOrderByUpdatedAtDesc(Boolean statusAvailable);

    List<PackageCategory> findAllByStatusAvailableOrderByDisplayOrder(Boolean statusAvailable);

    List<PackageCategory> findAllByOrderByDisplayOrder();

    @Query("SELECT COALESCE(MAX(c.displayOrder), 0) FROM PackageCategory c")
    Integer findMaxDisplayOrder();

    PackageCategory findByCategoryId(Long categoryId);
}

