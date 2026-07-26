package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.PackageOrderDTO;
import com.rehnoor.certusbackend.dto.PackageRequestDTO;
import com.rehnoor.certusbackend.dto.PackageResponseDTO;
import com.rehnoor.certusbackend.model.Package;
import com.rehnoor.certusbackend.repository.PackageCategoryRepository;
import com.rehnoor.certusbackend.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PackageService {
    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private PackageCategoryRepository packageCategoryRepository;

    // this is for the viewer
    public List<PackageResponseDTO> getPackages() {
        return packageRepository.findAllByStatusAvailableTrueOrderByCategory_DisplayOrderAscDisplayOrderAsc()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // this is for the admin
    public List<PackageResponseDTO> getAllPackages() {
        return packageRepository.findAllByOrderByDisplayOrder()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public void createPackage(PackageRequestDTO payload) {
        Package pkg = new Package();
        pkg.setName(payload.getName());
        pkg.setPrice(payload.getPrice());
        pkg.setNumberOfTests(payload.getNumberOfTests());
        pkg.setImageUrl(payload.getImageUrl());
        pkg.setStatusAvailable(payload.getStatusAvailable() != null ? payload.getStatusAvailable() : true);
        pkg.setDisplayOrder(payload.getDisplayOrder() != null ? payload.getDisplayOrder() : packageRepository.findMaxDisplayOrder() + 1);

        if (payload.getCategoryId() != null && payload.getCategoryId() > 0) {
            pkg.setCategory(packageCategoryRepository.findById(payload.getCategoryId()).orElse(null));
        } else {
            pkg.setCategory(null);
        }
        packageRepository.save(pkg);
    }

    public void updatePackage(Long packageId, PackageRequestDTO payload) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        if (payload.getName() != null) pkg.setName(payload.getName());
        if (payload.getPrice() != null) pkg.setPrice(payload.getPrice());
        if (payload.getNumberOfTests() != null) pkg.setNumberOfTests(payload.getNumberOfTests());
        if (payload.getImageUrl() != null) pkg.setImageUrl(payload.getImageUrl());
        if (payload.getStatusAvailable() != null) pkg.setStatusAvailable(payload.getStatusAvailable());
        if (payload.getDisplayOrder() != null) pkg.setDisplayOrder(payload.getDisplayOrder());

        if (payload.getCategoryId() != null) {
            if (payload.getCategoryId() <= 0) {
                pkg.setCategory(null);
            } else {
                pkg.setCategory(packageCategoryRepository.findById(payload.getCategoryId()).orElse(null));
            }
        }
        packageRepository.save(pkg);
    }

    public void deletePackage(Long packageId) {
        packageRepository.deleteById(packageId);
    }

    public boolean reorder(List<PackageOrderDTO> orderList) {
        for (PackageOrderDTO orderObj : orderList) {
            packageRepository.findById(orderObj.packageId).ifPresent(pkg -> {
                pkg.setDisplayOrder(orderObj.displayOrder);
                packageRepository.save(pkg);
            });
        }
        return true;
    }

    private PackageResponseDTO mapToDTO(Package pkg) {
        return new PackageResponseDTO(
                pkg.getPackageId(),
                pkg.getCategory() != null ? pkg.getCategory().getCategoryId() : null,
                pkg.getName(),
                pkg.getNumberOfTests(),
                pkg.getImageUrl(),
                pkg.getPrice(),
                pkg.getDisplayOrder()
        );
    }
}


