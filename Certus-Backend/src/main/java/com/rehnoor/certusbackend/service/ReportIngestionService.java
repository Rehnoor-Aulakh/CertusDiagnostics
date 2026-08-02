package com.rehnoor.certusbackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rehnoor.certusbackend.dto.ReportResponse;
import com.rehnoor.certusbackend.exception.DuplicateReportException;
import com.rehnoor.certusbackend.exception.InvalidPdfException;
import com.rehnoor.certusbackend.exception.PatientNotMatchingException;
import com.rehnoor.certusbackend.exception.ResourceNotFoundException;
import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.model.Report;
import com.rehnoor.certusbackend.parser.MetadataExtractor;
import com.rehnoor.certusbackend.parser.ReportAssembler;
import com.rehnoor.certusbackend.parser.RowClassifier;
import com.rehnoor.certusbackend.parser.TableExtractor;
import com.rehnoor.certusbackend.parser.model.DiagnosticMetadata;
import com.rehnoor.certusbackend.parser.model.DiagnosticReport;
import com.rehnoor.certusbackend.parser.model.ExtractedTable;
import com.rehnoor.certusbackend.parser.model.TestResult;
import com.rehnoor.certusbackend.repository.IdentityMappingRepository;
import com.rehnoor.certusbackend.repository.PatientRepository;
import com.rehnoor.certusbackend.repository.ReportRepository;
import net.datafaker.Faker;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class ReportIngestionService {

    @Value("${app.upload.directory}")
    private String uploadDirectory;
    private final HealthHistoryService healthHistoryService;
    private final PatientRepository patientRepository;
    private final ReportRepository reportRepository;
    private final IdentityMappingRepository identityMappingRepository;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    public ReportIngestionService(
            PatientRepository patientRepository,
            ReportRepository reportRepository,
            IdentityMappingRepository identityMappingRepository,
            ObjectMapper objectMapper,
            EmailService emailService,
            HealthHistoryService healthHistoryService) {
        this.patientRepository = patientRepository;
        this.reportRepository = reportRepository;
        this.identityMappingRepository = identityMappingRepository;
        this.objectMapper = objectMapper;
        this.emailService = emailService;
        this.healthHistoryService = healthHistoryService;
    }

    private final Faker faker = new Faker(Locale.forLanguageTag("en-IN"));

    // direct pdf report for database seeder service
    private DiagnosticReport extractReport(File pdfFile) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            TableExtractor tableExtractor = new TableExtractor();
            RowClassifier rowClassifier = new RowClassifier();
            MetadataExtractor metadataExtractor = new MetadataExtractor();
            ReportAssembler reportAssembler = new ReportAssembler();

            DiagnosticMetadata metadata = metadataExtractor.extract(document);
            List<ExtractedTable> tables = tableExtractor.extractTables(document);

            return reportAssembler.assemble(metadata, tables, rowClassifier);
        }
    }
    // overloaded function for http requests
    private DiagnosticReport extractReport(InputStream inputStream) throws IOException {
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            TableExtractor tableExtractor = new TableExtractor();
            RowClassifier rowClassifier = new RowClassifier();
            MetadataExtractor metadataExtractor = new MetadataExtractor();
            ReportAssembler reportAssembler = new ReportAssembler();

            DiagnosticMetadata metadata = metadataExtractor.extract(document);
            List<ExtractedTable> tables = tableExtractor.extractTables(document);

            return reportAssembler.assemble(metadata, tables, rowClassifier);
        }
    }

    @Transactional
    public Long processDiagnosticPDFWithFakeData(File pdfFile) throws IOException {
        DiagnosticReport diagnosticReport = extractReport(pdfFile);
        DiagnosticMetadata metadata = diagnosticReport.getMetadata();

        if (metadata.getPatientName() == null || metadata.getPatientName().isBlank())
            throw new com.rehnoor.certusbackend.exception.ReportParsingException(
                    "Unable to extract patient information from PDF.");
        String cleanedRealName = metadata.getPatientName().trim();

        Optional<Long> existingFakeId = identityMappingRepository.findFakeIdByRealName(cleanedRealName);
        Patient patient;

        if (existingFakeId.isPresent()) {
            patient = patientRepository.findById(existingFakeId.get()).orElseThrow();
        } else {
            patient = new Patient();
            patient.setPassword("");

            Patient.Gender mappedGender = Patient.Gender.Other;
            if (metadata.getGender() != null) {
                switch (metadata.getGender()) {
                    case MALE -> mappedGender = Patient.Gender.Male;
                    case FEMALE -> mappedGender = Patient.Gender.Female;
                    default -> mappedGender = Patient.Gender.Other;
                }
            }
            patient.setGender(mappedGender);

            int detectedAge = metadata.getAge() != null ? metadata.getAge() : 30;
            int currentYear = LocalDate.now().getYear();
            LocalDate inferredBirthYear = LocalDate.of(currentYear - detectedAge, 1, 1);
            patient.setDob(inferredBirthYear);

            String fakeFirstName = (mappedGender == Patient.Gender.Female) ? faker.name().femaleFirstName()
                    : faker.name().firstName();
            String fakeLastName = faker.name().lastName();
            String fullFakeName = fakeFirstName + " " + fakeLastName;
            patient.setName(fullFakeName);

            String cleanEmail = fullFakeName.toLowerCase().replaceAll("\\s+", "") + "@gmail.com";
            patient.setEmail(cleanEmail);

            String cleanPhone = "9" + faker.number().digits(9);
            patient.setPhone(cleanPhone);

            patient = patientRepository.save(patient);
            identityMappingRepository.saveMapping(cleanedRealName, patient.getPatientId());
        }

        Report savedReport = saveReport(pdfFile, diagnosticReport, patient);
        System.out.println("Fake Data Ingestion Successful: " + pdfFile.getName() + " -> " + patient.getName());
        return savedReport.getReportId();
    }

    @Transactional
    public void processDiagnosticPDFWithRealData(File pdfFile) throws IOException {
        DiagnosticReport diagnosticReport = extractReport(pdfFile);
        DiagnosticMetadata metadata = diagnosticReport.getMetadata();

        if (metadata.getPatientName() == null || metadata.getPatientName().isBlank())
            throw new com.rehnoor.certusbackend.exception.ReportParsingException(
                    "Unable to extract patient information from PDF.");

        String realName = metadata.getPatientName().trim();

        Optional<Patient> existingPatient = patientRepository.findAll().stream()
                .filter(p -> p.getName().equalsIgnoreCase(realName))
                .findFirst();

        Patient patient;
        if (existingPatient.isPresent()) {
            patient = existingPatient.get();
        } else {
            patient = new Patient();
            patient.setPassword("");
            patient.setName(realName);

            Patient.Gender mappedGender = Patient.Gender.Other;
            if (metadata.getGender() != null) {
                switch (metadata.getGender()) {
                    case MALE -> mappedGender = Patient.Gender.Male;
                    case FEMALE -> mappedGender = Patient.Gender.Female;
                    default -> mappedGender = Patient.Gender.Other;
                }
            }
            patient.setGender(mappedGender);

            int detectedAge = metadata.getAge() != null ? metadata.getAge() : 30;
            int currentYear = LocalDate.now().getYear();
            patient.setDob(LocalDate.of(currentYear - detectedAge, 1, 1));

            String cleanEmail = realName.toLowerCase().replaceAll("\\s+", "") + "@gmail.com";
            patient.setEmail(cleanEmail);

            patient.setPhone(null);

            patient = patientRepository.save(patient);
        }

        Report savedReport = saveReport(pdfFile, diagnosticReport, patient);
        System.out.println("Real Data Ingestion Successful: " + pdfFile.getName() + " -> " + patient.getName());

    }

    private String normalizeName(String name) {
        return name == null ? "" :
                name.trim()
                        .replaceAll("\\s+", " ")
                        .toLowerCase();
    }

    private int reportMatchPatient(DiagnosticMetadata metadata, Patient patient) {
        int score = 0;
        // string matching algorithm to score the name of the patient
        String reportName = normalizeName(metadata.getPatientName());
        String patientName = normalizeName(patient.getName());
        
        if (reportName.equals(patientName)) {
            score += 50;
        } else if (!reportName.isEmpty() && !patientName.isEmpty() && 
                  (reportName.contains(patientName) || patientName.contains(reportName))) {
            score += 30;
        }

        // age matching logic
        if (metadata.getAge() != null && patient.getDob() != null) {
            int reportBirthYear = LocalDate.now().getYear() - metadata.getAge();
            int patientBirthYear = patient.getDob().getYear();
            if(Math.abs(reportBirthYear-patientBirthYear)<=1) {
                score+=30;
            }
        }
        
        // gender score
        if (metadata.getGender() != null &&
                patient.getGender() != null &&
                metadata.getGender().name().equalsIgnoreCase(patient.getGender().name())) {

            score += 20;
        }
        return score;
    }

    // This is the method that our report upload controller will call
    @Transactional
    public Long processUploadedDiagnosticPDF(MultipartFile multipartFile, String email, String phone, boolean forceCreate)
            throws IOException {
        if (multipartFile.isEmpty()) {
            throw new com.rehnoor.certusbackend.exception.InvalidPdfException("Empty file.");
        }
        if (!"application/pdf".equals(multipartFile.getContentType())) {
            throw new com.rehnoor.certusbackend.exception.InvalidPdfException("Only PDF reports are supported.");
        }
        // email and phone are provided
        // first get the metadata from
        DiagnosticReport diagnosticReport = extractReport(multipartFile.getInputStream());
        DiagnosticMetadata metadata = diagnosticReport.getMetadata();
        if (metadata.getPatientName() == null || metadata.getPatientName().isBlank())
            throw new com.rehnoor.certusbackend.exception.ReportParsingException(
                    "Unable to extract patient information from PDF.");
        // now that you have the data, get the patient details from email or phone whichever is available
        Optional<Patient> patientOpt = Optional.empty();
        if (email != null && !email.isBlank()) {
            patientOpt = patientRepository.findByEmailIgnoreCase(email);
        }
        if(patientOpt.isEmpty() && phone != null && !phone.trim().isEmpty()) {
            try {
                patientOpt = patientRepository.findByPhone(phone);
            } catch (org.springframework.dao.IncorrectResultSizeDataAccessException e) {
                // In case multiple users somehow have the same phone, we just pick the first one
                patientOpt = patientRepository.findAll().stream().filter(p -> phone.equals(p.getPhone())).findFirst();
            }
        }
        
        Patient patient;
        if(patientOpt.isEmpty()) {
            if (!forceCreate) {
                String reportName = metadata.getPatientName() != null ? metadata.getPatientName().trim() : "";
                java.util.List<Patient> similarPatients = patientRepository.findByNameContainingIgnoreCase(reportName);
                
                java.util.List<java.util.Map<String, Object>> suggestedList = similarPatients.stream()
                        .filter(p -> reportMatchPatient(metadata, p) >= 80)
                        .map(p -> {
                            java.util.Map<String, Object> map = new java.util.HashMap<>();
                            map.put("id", p.getPatientId());
                            map.put("name", p.getName());
                            map.put("email", p.getEmail());
                            map.put("phone", p.getPhone());
                            map.put("gender", p.getGender() != null ? p.getGender().name() : "Unknown");
                            map.put("age", p.getDob() != null ? (LocalDate.now().getYear() - p.getDob().getYear()) : "Unknown");
                            return map;
                        })
                        .collect(java.util.stream.Collectors.toList());

                if (!suggestedList.isEmpty()) {
                    throw new com.rehnoor.certusbackend.exception.PatientNotMatchingException(
                            "The email or phone number belongs to a new patient, but we found similar patients in the database.", 
                            suggestedList, true);
                }
            }
            patient = createPatient(metadata, email, phone);
        } else{
            patient = patientOpt.get();
            // you have the patient-> now call the scoring function to check if the metadata matches with the patient in the database
            if(reportMatchPatient(metadata, patient)<80) {
                String reportName = metadata.getPatientName() != null ? metadata.getPatientName().trim() : "";
                java.util.List<Patient> similarPatients = patientRepository.findByNameContainingIgnoreCase(reportName);
                
                java.util.List<java.util.Map<String, Object>> suggestedList = similarPatients.stream()
                        .filter(p -> reportMatchPatient(metadata, p) >= 80)
                        .map(p -> {
                            java.util.Map<String, Object> map = new java.util.HashMap<>();
                            map.put("id", p.getPatientId());
                            map.put("name", p.getName());
                            map.put("email", p.getEmail());
                            map.put("phone", p.getPhone());
                            map.put("gender", p.getGender() != null ? p.getGender().name() : "Unknown");
                            map.put("age", p.getDob() != null ? (LocalDate.now().getYear() - p.getDob().getYear()) : "Unknown");
                            return map;
                        })
                        .collect(java.util.stream.Collectors.toList());

                throw new com.rehnoor.certusbackend.exception.PatientNotMatchingException(
                        "Report metadata does not match existing patient details.", suggestedList, false);
            }
        }
        Files.createDirectories(Paths.get(uploadDirectory));

        String rawFilename = System.currentTimeMillis() + "_" + (multipartFile.getOriginalFilename() != null ? multipartFile.getOriginalFilename() : "report.pdf");
        String filename = rawFilename.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9._-]", "_");

        Path destination = Paths.get(uploadDirectory, filename);
        Files.copy(multipartFile.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        File pdfFile = destination.toFile();

        Report savedReport = saveReport(pdfFile, diagnosticReport, patient);
        // Refresh the cached health history
        healthHistoryService.rebuildHealthHistory(patient);
        System.out.println("Real Data Ingestion Successful: " + pdfFile.getName() + " -> " + patient.getName());
        emailService.sendReportUploadedEmail(patient, savedReport, pdfFile, diagnosticReport);
        return savedReport.getReportId();
    }

    @Transactional
    public Long processUploadedDiagnosticPDF(MultipartFile multipartFile, Long patientId) throws IOException {
        if (multipartFile.isEmpty()) {
            throw new InvalidPdfException("Empty file.");
        }
        if (!"application/pdf".equals(multipartFile.getContentType())) {
            throw new InvalidPdfException("Only PDF reports are supported.");
        }
        DiagnosticReport diagnosticReport = extractReport(multipartFile.getInputStream());

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        DiagnosticMetadata diagnosticMetadata = diagnosticReport.getMetadata();


        if(reportMatchPatient(diagnosticMetadata, patient)<80) {
            throw new PatientNotMatchingException("The patient report does not match the selected patient, you may have selected the wrong patient or with incorrect credentials");
        }

        Files.createDirectories(Paths.get(uploadDirectory));

        String rawFilename = System.currentTimeMillis() + "_" + (multipartFile.getOriginalFilename() != null ? multipartFile.getOriginalFilename() : "report.pdf");
        String filename = rawFilename.replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9._-]", "_");

        Path destination = Paths.get(uploadDirectory, filename);

        Files.copy(multipartFile.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        File pdfFile = destination.toFile();



        Report savedReport = saveReport(pdfFile, diagnosticReport, patient);
        // Refresh the cached health history
        healthHistoryService.rebuildHealthHistory(patient);
        System.out.println("Real Data Ingestion Successful: " + pdfFile.getName() + " -> " + patient.getName());
        emailService.sendReportUploadedEmail(patient, savedReport, pdfFile, diagnosticReport);
        return savedReport.getReportId();
    }

    @Transactional(readOnly = true)
    public ReportResponse getReport(Long reportId, boolean detailed) throws JsonProcessingException {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        ReportResponse response = new ReportResponse();
        response.setReportId(report.getReportId());
        response.setPatientId(report.getPatientId().getPatientId());
        response.setTestName(report.getTestName());
        response.setPrice(report.getPrice());

        response.setReportStatus(report.getReportStatus());

        // Fallback for reportDate
        ZonedDateTime finalReportDate = report.getReportDate();
        if (finalReportDate == null) {
            finalReportDate = report.getReportReleasedOn();
        }
        if (finalReportDate == null) {
            finalReportDate = report.getSampleCollectedOn();
        }
        response.setReportDate(finalReportDate);

        response.setSampleCollectedOn(report.getSampleCollectedOn());
        response.setSampleReceivedOn(report.getSampleReceivedOn());
        response.setReportReleasedOn(report.getReportReleasedOn());

        List<TestResult> testsList = objectMapper.readValue(report.getTestsData(),
                new TypeReference<List<TestResult>>() {
                });
        List<TestResult> abnormalList = objectMapper.readValue(report.getAbnormalData(),
                new TypeReference<List<TestResult>>() {
                });

        if (!detailed) {
            if (testsList != null) {
                testsList.forEach(t -> {
                    t.setMethod(null);
                    t.setTechnology(null);
                });
            }
            if (abnormalList != null) {
                abnormalList.forEach(t -> {
                    t.setMethod(null);
                    t.setTechnology(null);
                });
            }
        }

        response.setTests(testsList);
        response.setAbnormal(abnormalList);

        int totalTestsCount = testsList != null ? testsList.size() : 0;
        int abnormalTestsCount = abnormalList != null ? abnormalList.size() : 0;
        response.setSummary(new ReportResponse.Summary(totalTestsCount, abnormalTestsCount));

        return response;
    }

    private Patient createPatient(DiagnosticMetadata metadata, String email, String phone) {
        Patient patient = new Patient();
        patient.setPassword("");
        String realName = metadata.getPatientName().trim();
        patient.setName(realName);
        patient.setEmail(email.trim().toLowerCase());
        Patient.Gender mappedGender = Patient.Gender.Other;
        if (metadata.getGender() != null) {
            switch (metadata.getGender()) {
                case MALE -> mappedGender = Patient.Gender.Male;
                case FEMALE -> mappedGender = Patient.Gender.Female;
                default -> mappedGender = Patient.Gender.Other;
            }
        }
        patient.setGender(mappedGender);
        int detectedAge = metadata.getAge() != null ? metadata.getAge() : 30;
        int currentYear = LocalDate.now().getYear();
        patient.setDob(LocalDate.of(currentYear - detectedAge, 1, 1));

        if (phone != null && !phone.isBlank()) {
            patient.setPhone(phone.trim());
        } else {
            patient.setPhone(null);
        }
        patient = patientRepository.save(patient);
        return patient;
    }

    private Report saveReport(File pdfFile, DiagnosticReport diagnosticReport, Patient patient) throws IOException {
        DiagnosticMetadata metadata = diagnosticReport.getMetadata();

        Report report = new Report();
        report.setPatientId(patient);

        String pkgName = metadata.getPackageName();
        report.setTestName(pkgName != null && !pkgName.isBlank() ? pkgName.trim() : "Diagnostic Assessment Profile");

        report.setPrice(
                metadata.getAmountCollected() != null ? metadata.getAmountCollected() : java.math.BigDecimal.ZERO);
        report.setReportLocation(pdfFile.getName());

        ZoneId defaultZone = ZoneId.of("Asia/Kolkata");
        LocalDate maxDate = patient.getLastVisit();

        if (metadata.getSampleCollectedOn() != null) {
            LocalDate d = metadata.getSampleCollectedOn().toLocalDate();
            if (maxDate == null || d.isAfter(maxDate)) maxDate = d;
            report.setSampleCollectedOn(metadata.getSampleCollectedOn().atZone(defaultZone));
        }
        if (metadata.getSampleReceivedOn() != null) {
            LocalDate d = metadata.getSampleReceivedOn().toLocalDate();
            if (maxDate == null || d.isAfter(maxDate)) maxDate = d;
            report.setSampleReceivedOn(metadata.getSampleReceivedOn().atZone(defaultZone));
        }
        if (metadata.getReportReleasedOn() != null) {
            LocalDate d = metadata.getReportReleasedOn().toLocalDate();
            if (maxDate == null || d.isAfter(maxDate)) maxDate = d;
            report.setReportReleasedOn(metadata.getReportReleasedOn().atZone(defaultZone));
        }
        if (metadata.getReportDate() != null) {
            LocalDate d = metadata.getReportDate().toLocalDate();
            if (maxDate == null || d.isAfter(maxDate)) maxDate = d;
            report.setReportDate(metadata.getReportDate().atZone(defaultZone));
        }

        if (maxDate != null && (patient.getLastVisit() == null || maxDate.isAfter(patient.getLastVisit()))) {
            patient.setLastVisit(maxDate);
            patientRepository.save(patient);
        }

        report.setReportStatus(Report.ReportStatus.COMPLETED);

        report.setTestsIncluded(objectMapper.writeValueAsString(diagnosticReport.getTestsIncluded()));
        report.setTestsData(objectMapper.writeValueAsString(diagnosticReport.getTests()));
        report.setAbnormalData(objectMapper.writeValueAsString(diagnosticReport.getAbnormalTests()));
        report.generateReportHash();
        if (reportRepository.existsByReportHash(report.getReportHash())) {
            throw new DuplicateReportException("This diagnostic report has already been uploaded");
        }
        return reportRepository.save(report);
    }
}