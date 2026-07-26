package com.rehnoor.certusbackend.controller.viewer;

import com.rehnoor.certusbackend.dto.PackageResponseDTO;
import com.rehnoor.certusbackend.service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController("viewerPackageController")
@RequestMapping("/api/v1/viewer/packages")
public class PackageController {

    @Autowired
    private PackageService packageService;

    // implementing the get all packages controller
    @GetMapping("")
    public ResponseEntity<?> getAllPackages() {
        List<PackageResponseDTO> packages = packageService.getPackages();
        return ResponseEntity.ok(Map.of("success", true, "data", packages));
    }
}

