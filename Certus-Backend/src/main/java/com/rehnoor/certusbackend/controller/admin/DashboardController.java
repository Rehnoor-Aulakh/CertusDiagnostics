package com.rehnoor.certusbackend.controller.admin;

import com.rehnoor.certusbackend.dto.DashboadDataResponse;
import com.rehnoor.certusbackend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/v1/admin/dashboard")
public class DashboardController {
    @Autowired
    DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<?> getAdminDashboardStats() {
        DashboadDataResponse response = new DashboadDataResponse();
        response.setData(dashboardService.getMetrics());
        return ResponseEntity.ok(response);
    }

}
