package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.CategoryOrderDTO;
import com.rehnoor.certusbackend.dto.PackageCategoryRequestDTO;
import com.rehnoor.certusbackend.dto.PackageCategoryResponse;
import com.rehnoor.certusbackend.model.PackageCategory;
import com.rehnoor.certusbackend.repository.PackageCategoryRepository;
import com.rehnoor.certusbackend.repository.PackageRepository;
import org.bouncycastle.util.Pack;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PackageCategoryService {
    @Autowired
    private PackageCategoryRepository packageCategoryRepository;

    public List<PackageCategoryResponse> getAllPackageCategories() {
        return packageCategoryRepository.findAllByOrderByDisplayOrder()
                .stream()
                .map(category -> new PackageCategoryResponse(
                        category.getCategoryId(),
                        category.getName(),
                        category.getStatusAvailable(),
                        category.getImageUrl(),
                        category.getDisplayOrder()
                ))
                .toList();
    }

    public void uploadPackageCategory(String name, String imageUrl) {
        PackageCategory category = new PackageCategory();
        category.setName(name != null ? name.trim() : null);
        category.setImageUrl((imageUrl != null && !imageUrl.trim().isEmpty()) ? imageUrl.trim() : null);
        category.setDisplayOrder(packageCategoryRepository.findMaxDisplayOrder() + 1);
        packageCategoryRepository.save(category);
    }

    public List<PackageCategoryResponse> getPackageCategories() {
        return packageCategoryRepository.findAllByStatusAvailableOrderByDisplayOrder(true)
                .stream()
                .map(category -> new PackageCategoryResponse(
                        category.getCategoryId(),
                        category.getName(),
                        category.getStatusAvailable(),
                        category.getImageUrl(),
                        category.getDisplayOrder()
                ))
                .toList();
    }

    public boolean reorder(List<CategoryOrderDTO> orderList) {
        // it goes on and assigns the display order to the category_id
        for(CategoryOrderDTO orderObj: orderList) {
            PackageCategory category = packageCategoryRepository.getPackageCategoryByCategoryId(orderObj.categoryId);
            category.setDisplayOrder(orderObj.displayOrder);
            packageCategoryRepository.save(category);
        }
        return true;
    }

    public void updatePackageCategory(Long categoryId, PackageCategoryRequestDTO payload) {
        PackageCategory category = packageCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (payload.getName() != null) {
            category.setName(payload.getName().trim());
        }
        if (payload.getStatus() != null) {
            category.setStatusAvailable(payload.getStatus());
        }
        if (payload.getImageUrl() != null) {
            category.setImageUrl(!payload.getImageUrl().trim().isEmpty() ? payload.getImageUrl().trim() : null);
        }
        packageCategoryRepository.save(category);
    }

    public void deletePackageCategory(Long categoryId) {
        PackageCategory category = packageCategoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category not found"));
        // just mark the statusAvailable as false
        category.setStatusAvailable(false);
        packageCategoryRepository.save(category);
    }
}
