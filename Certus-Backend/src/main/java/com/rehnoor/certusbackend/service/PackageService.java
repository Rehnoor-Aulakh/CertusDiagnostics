package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.PackageResponseDTO;
import com.rehnoor.certusbackend.model.Package;
import com.rehnoor.certusbackend.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PackageService {
    @Autowired
    private PackageRepository packageRepository;

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

