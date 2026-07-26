package com.rehnoor.certusbackend.controller.viewer;

import com.rehnoor.certusbackend.dto.PackageCategoryResponse;
import com.rehnoor.certusbackend.service.PackageCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class PackageCategoryController {
    @Autowired
    PackageCategoryService packageCategoryService;
    // anyone can view the package category
    @GetMapping("/viewer/package-categories")
    public ResponseEntity<?> getPackageCategories() {
        // when viewer wants to fetch all the categories, we just sort them in the display order

        List<PackageCategoryResponse> result = packageCategoryService.getPackageCategories();
        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }
}
