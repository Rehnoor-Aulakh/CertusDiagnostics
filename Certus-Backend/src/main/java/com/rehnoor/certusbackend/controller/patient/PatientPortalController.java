package com.rehnoor.certusbackend.controller.patient;

import com.rehnoor.certusbackend.dto.history.HealthHistoryResponse;
import com.rehnoor.certusbackend.service.HealthHistoryService;
import com.rehnoor.certusbackend.service.PatientPortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientPortalController {

    @Autowired
    private PatientPortalService patientPortalService;

    @GetMapping("/reports")
    public ResponseEntity<?> getMyReports(Authentication authentication) {
        String email = authentication.getName();
        List<Map<String, Object>> summaries = patientPortalService.getReportSummaries(email);
        return ResponseEntity.ok(Map.of("success", true, "reports", summaries));
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<?> getReportDetails(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        try {
            Map<String, Object> details = patientPortalService.getReportDetails(id, email);
            return ResponseEntity.ok(Map.of("success", true, "report", details));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Access denied"));
        }
    }

    @GetMapping("/reports/{id}/download")
    public ResponseEntity<Resource> downloadReport(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        try {
            Resource resource = patientPortalService.getReportPdf(id, email);
            if (resource == null) {
                return ResponseEntity.notFound().build();
            }
            String filename = patientPortalService.getReportFilename(id);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getPatientHistory(Authentication authentication){
        String email = authentication.getName();
        HealthHistoryResponse response = patientPortalService.getHealthHistory(email);
        return ResponseEntity.ok(response);

    }
}
