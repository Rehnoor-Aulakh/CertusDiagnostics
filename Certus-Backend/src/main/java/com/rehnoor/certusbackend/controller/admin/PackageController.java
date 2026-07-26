package com.rehnoor.certusbackend.controller.admin;

import com.rehnoor.certusbackend.dto.PackageOrderDTO;
import com.rehnoor.certusbackend.dto.PackageRequestDTO;
import com.rehnoor.certusbackend.dto.PackageResponseDTO;
import com.rehnoor.certusbackend.model.Package;
import com.rehnoor.certusbackend.service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("adminPackageController")
@RequestMapping("/api/v1/admin/packages")
@PreAuthorize("hasRole('ADMIN')")
public class PackageController {

    @Autowired
    private PackageService packageService;

    // get all the packages
    @GetMapping("")
    public ResponseEntity<?> getAllPackages() {
        List<PackageResponseDTO> packages = packageService.getAllPackages();
        return ResponseEntity.ok(Map.of("success", true, "data", packages));
    }

    @PostMapping("")
    public ResponseEntity<?> createPackage(@RequestBody PackageRequestDTO payload) {
        packageService.createPackage(payload);
        return ResponseEntity.ok(Map.of("success", true, "message", "Package created successfully!"));
    }

    @PatchMapping("/{packageId}")
    public ResponseEntity<?> updatePackage(@PathVariable Long packageId, @RequestBody PackageRequestDTO payload) {
        packageService.updatePackage(packageId, payload);
        return ResponseEntity.ok(Map.of("success", true, "message", "Package updated successfully!"));
    }

    @DeleteMapping("/{packageId}")
    public ResponseEntity<?> deletePackage(@PathVariable Long packageId) {
        packageService.deletePackage(packageId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Package deleted successfully!"));
    }

    @PutMapping("/reorder")
    public ResponseEntity<?> reorderPackages(@RequestBody List<PackageOrderDTO> orderList) {
        if (packageService.reorder(orderList)) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Order changed successfully!"));
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}

