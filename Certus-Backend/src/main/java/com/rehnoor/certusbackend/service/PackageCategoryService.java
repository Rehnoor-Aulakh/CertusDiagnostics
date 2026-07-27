package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.CategoryOrderDTO;
import com.rehnoor.certusbackend.dto.PackageCategoryRequestDTO;
import com.rehnoor.certusbackend.dto.PackageCategoryResponse;
import com.rehnoor.certusbackend.model.PackageCategory;
import com.rehnoor.certusbackend.repository.PackageCategoryRepository;
import com.rehnoor.certusbackend.repository.PackageRepository;
import org.bouncycastle.util.Pack;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class PackageCategoryService {
    @Value("${app.package-category.directory}")
    private String packageDirectory;

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
                        category.getDisplayOrder()))
                .toList();
    }

    public void uploadPackageCategory(String name, MultipartFile image) throws IOException {
        PackageCategory category = new PackageCategory();
        category.setName(name != null ? name.trim() : null);
        if (image != null && !image.isEmpty()) {
            // handle add image to the category
            handleAddImage(category, image);
        }
        category.setDisplayOrder(packageCategoryRepository.findMaxDisplayOrder() + 1);
        packageCategoryRepository.save(category);
    }

    private void handleAddImage(PackageCategory category, MultipartFile image) throws IOException {
        Files.createDirectories(Paths.get(packageDirectory));
        String rawName = (category.getName() != null ? category.getName() : "category") + "_"
                + System.currentTimeMillis() + "_"
                + (image.getOriginalFilename() != null ? image.getOriginalFilename() : "image.jpg");
        String filename = rawName.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9._-]", "_");
        Path destination = Paths.get(packageDirectory, filename);
        Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        // the file is now saved, you need to add the imageUrl to the database
        File imageFile = destination.toFile();
        category.setImageUrl(imageFile.getName());
    }

    public List<PackageCategoryResponse> getPackageCategories() {
        return packageCategoryRepository.findAllByStatusAvailableOrderByDisplayOrder(true)
                .stream()
                .map(category -> new PackageCategoryResponse(
                        category.getCategoryId(),
                        category.getName(),
                        category.getStatusAvailable(),
                        category.getImageUrl(),
                        category.getDisplayOrder()))
                .toList();
    }

    public boolean reorder(List<CategoryOrderDTO> orderList) {
        // it goes on and assigns the display order to the category_id
        for (CategoryOrderDTO orderObj : orderList) {
            PackageCategory category = packageCategoryRepository.getPackageCategoryByCategoryId(orderObj.categoryId);
            category.setDisplayOrder(orderObj.displayOrder);
            packageCategoryRepository.save(category);
        }
        return true;
    }

    public void updatePackageCategory(Long categoryId, PackageCategoryRequestDTO payload, MultipartFile image)
            throws IOException {
        PackageCategory category = packageCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (payload.getName() != null) {
            category.setName(payload.getName().trim());
        }
        if (payload.getStatus() != null) {
            category.setStatusAvailable(payload.getStatus());
        }
        if (image != null && !image.isEmpty()) {
            handleAddImage(category, image);
        } else if (payload.getImageUrl() != null) {
            category.setImageUrl(!payload.getImageUrl().trim().isEmpty() ? payload.getImageUrl().trim() : null);
        }
        packageCategoryRepository.save(category);
    }

    public void deletePackageCategory(Long categoryId) {
        PackageCategory category = packageCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        // just mark the statusAvailable as false
        category.setStatusAvailable(false);
        packageCategoryRepository.save(category);
    }
}
