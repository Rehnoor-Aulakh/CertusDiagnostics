package com.rehnoor.certusbackend.controller.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.rehnoor.certusbackend.dto.ReportResponse;
import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.model.Report;
import com.rehnoor.certusbackend.repository.PatientRepository;
import com.rehnoor.certusbackend.repository.ReportRepository;
import com.rehnoor.certusbackend.service.ReportIngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;

import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Value("${app.upload.directory}")
    private String uploadDirectory;

    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ReportIngestionService reportIngestionService;

    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<Resource> viewReport(@PathVariable String filename) throws MalformedURLException {
        Path filePath = Paths.get(uploadDirectory).resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadReport(@RequestParam("file")MultipartFile file, @RequestParam("email") String email, @RequestParam(value = "phone", required = false) String phone){
        try{
            Long reportId = reportIngestionService.processUploadedDiagnosticPDF(file, email, phone);
            return ResponseEntity.ok(Map.of("success", true, "report_id", reportId));
        } catch(Exception e){
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping(value = "/{patientId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadReportForPatient(@PathVariable Long patientId, @RequestParam("file")MultipartFile file){
        try{
            Long reportId = reportIngestionService.processUploadedDiagnosticPDF(file, patientId);
            return ResponseEntity.ok(Map.of("success", true, "report_id", reportId));
        } catch(Exception e){
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReport(
            @PathVariable Long id,
            @RequestParam(value = "detailed", defaultValue = "false") boolean detailed) throws JsonProcessingException {
        return ResponseEntity.ok(reportIngestionService.getReport(id, detailed));
    }

    @GetMapping
    public ResponseEntity<?> getAllReports() {
        List<Report> reports = reportRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        List<Map<String, Object>> data = reports.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("report_id", r.getReportId());
            map.put("patient_name", r.getPatientId() != null ? r.getPatientId().getName() : "Unknown");
            map.put("patient_id", r.getPatientId() != null ? r.getPatientId().getPatientId() : null);
            map.put("test_name", r.getTestName());
            
            if (r.getReportDate() != null) {
                map.put("test_date_time", r.getReportDate().format(formatter));
            } else {
                map.put("test_date_time", null);
            }
            
            map.put("status", r.getReportStatus() != null ? r.getReportStatus().name() : "PENDING");
            map.put("price", r.getPrice());
            map.put("report_location", r.getReportLocation());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> addReport(@RequestBody Map<String, Object> payload) {
        try {
            Long patientId = Long.valueOf(payload.get("patient_id").toString());
            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            if (patientOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Patient not found"));
            }
            
            Report r = new Report();
            r.setPatientId(patientOpt.get());
            r.setTestName((String) payload.get("test_name"));
            r.setPrice(new BigDecimal(payload.get("price").toString()));
            
            if (payload.containsKey("test_date_time") && payload.get("test_date_time") != null) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                LocalDateTime ldt = LocalDateTime.parse(payload.get("test_date_time").toString(), formatter);
                r.setReportDate(ldt.atZone(ZoneId.systemDefault()));
            } else {
                r.setReportDate(ZonedDateTime.now());
            }
            
            r.setReportStatus(Report.ReportStatus.PENDING);
            Report saved = reportRepository.save(r);
            
            return ResponseEntity.ok(Map.of("success", true, "data", Map.of("id", saved.getReportId(), "email_sent", false)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PatchMapping
    public ResponseEntity<?> updateReport(@RequestBody Map<String, Object> payload) {
        try {
            Long id = Long.valueOf(payload.get("report_id").toString());
            Optional<Report> opt = reportRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Report not found"));
            
            Report r = opt.get();
            if (payload.containsKey("test_name")) r.setTestName((String) payload.get("test_name"));
            if (payload.containsKey("price")) r.setPrice(new BigDecimal(payload.get("price").toString()));
            
            reportRepository.save(r);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @DeleteMapping
    public ResponseEntity<?> deleteReport(@RequestBody Map<String, Object> payload) {
        try {
            Long id = Long.valueOf(payload.get("report_id").toString());
            reportRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
