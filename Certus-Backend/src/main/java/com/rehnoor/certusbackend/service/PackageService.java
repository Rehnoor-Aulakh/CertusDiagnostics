package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.PackageOrderDTO;
import com.rehnoor.certusbackend.dto.PackageRequestDTO;
import com.rehnoor.certusbackend.dto.PackageResponseDTO;
import com.rehnoor.certusbackend.model.Package;
import com.rehnoor.certusbackend.repository.PackageCategoryRepository;
import com.rehnoor.certusbackend.repository.PackageRepository;
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
public class PackageService {
    @Value("${app.package.directory}")
    private String packageDirectory;

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

    public void createPackage(PackageRequestDTO payload, MultipartFile image) throws IOException {
        Package pkg = new Package();
        pkg.setName(payload.getName());
        if(image != null && !image.isEmpty()) {
            addImage(image, pkg);
        }
        pkg.setPrice(payload.getPrice());
        pkg.setNumberOfTests(payload.getNumberOfTests());
        pkg.setStatusAvailable(payload.getStatusAvailable() != null ? payload.getStatusAvailable() : true);
        pkg.setDisplayOrder(payload.getDisplayOrder() != null ? payload.getDisplayOrder() : packageRepository.findMaxDisplayOrder() + 1);

        if (payload.getCategoryId() != null && payload.getCategoryId() > 0) {
            pkg.setCategory(packageCategoryRepository.findById(payload.getCategoryId()).orElse(null));
        } else {
            pkg.setCategory(null);
        }
        packageRepository.save(pkg);
    }
    private void addImage(MultipartFile image, Package pkg) throws IOException {
        Files.createDirectories(Paths.get(packageDirectory));
        String rawName = (pkg.getName() != null ? pkg.getName() : "package") + "_" + System.currentTimeMillis() + "_" + (image.getOriginalFilename() != null ? image.getOriginalFilename() : "image.jpg");
        String filename = rawName.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9._-]", "_");
        Path destination = Paths.get(packageDirectory, filename);
        Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        // the file is now saved, you need to add the imageUrl to the database
        File imageFile = destination.toFile();
        pkg.setImageUrl(imageFile.getName());
    }
    public void updatePackage(Long packageId, PackageRequestDTO payload, MultipartFile image) throws IOException {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        if (payload.getName() != null) pkg.setName(payload.getName());
        if(image != null && !image.isEmpty()) {
            // then the image is being updated too, so we need to call the add image function
            addImage(image, pkg);
        }
        if (payload.getPrice() != null) pkg.setPrice(payload.getPrice());
        if (payload.getNumberOfTests() != null) pkg.setNumberOfTests(payload.getNumberOfTests());
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


