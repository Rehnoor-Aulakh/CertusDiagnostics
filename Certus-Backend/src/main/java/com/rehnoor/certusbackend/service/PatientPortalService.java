package com.rehnoor.certusbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.model.Report;
import com.rehnoor.certusbackend.repository.PatientRepository;
import com.rehnoor.certusbackend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatientPortalService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${app.upload.directory}")
    private String uploadDirectory;

    public Patient getPatientByEmail(String email) {
        return patientRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Patient Not Found"));
    }

    public List<Map<String, Object>> getReportSummaries(String email) {
        Patient patient = getPatientByEmail(email);
        List<Report> reports = reportRepository.findByPatientIdOrderByReportDateDesc(patient);

        return reports.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getReportId());
            map.put("test_name", r.getTestName());
            map.put("date", r.getReportDate() != null
                    ? r.getReportDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : null);
            map.put("status", r.getReportStatus());
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getReportDetails(Long reportId, String email) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getPatientId().getEmail().equalsIgnoreCase(email)) {
            throw new SecurityException("Access denied");
        }

        Map<String, Object> details = new HashMap<>();
        details.put("id", report.getReportId());
        details.put("test_name", report.getTestName());
        details.put("date", report.getReportDate() != null
                ? report.getReportDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : null);

        try {
            if (report.getTestsData() != null) {
                details.put("tests", objectMapper.readValue(report.getTestsData(),
                        new TypeReference<List<Map<String, Object>>>() {}));
            }
            if (report.getAbnormalData() != null) {
                details.put("abnormal_tests", objectMapper.readValue(report.getAbnormalData(),
                        new TypeReference<List<Map<String, Object>>>() {}));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return details;
    }

    public Resource getReportPdf(Long reportId, String email) throws MalformedURLException {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        if (!report.getPatientId().getEmail().equalsIgnoreCase(email)) {
            throw new SecurityException("Access denied");
        }

        if (report.getReportLocation() == null || report.getReportLocation().isBlank()) {
            return null;
        }

        Path filePath = Paths.get(uploadDirectory).resolve(report.getReportLocation()).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return null;
        }

        return resource;
    }

    public String getReportFilename(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        return report.getReportLocation();
    }
}
