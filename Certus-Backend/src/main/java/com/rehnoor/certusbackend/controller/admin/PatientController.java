package com.rehnoor.certusbackend.controller.admin;

import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/patients")
@PreAuthorize("hasRole('ADMIN')")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping
    public ResponseEntity<?> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        List<Map<String, Object>> data = patients.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("patient_id", p.getPatientId());
            map.put("name", p.getName());
            map.put("email", p.getEmail());
            map.put("phone", p.getPhone());
            map.put("dob", p.getDob() != null ? p.getDob().toString() : "");
            map.put("gender", p.getGender() != null ? p.getGender().name() : "");
            map.put("created_at", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @PatchMapping
    public ResponseEntity<?> updatePatient(@RequestBody Map<String, Object> payload) {
        try {
            Long id = Long.valueOf(payload.get("patient_id").toString());
            Optional<Patient> opt = patientRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Patient not found"));
            
            Patient p = opt.get();
            if (payload.containsKey("name")) p.setName((String) payload.get("name"));
            if (payload.containsKey("email")) p.setEmail((String) payload.get("email"));
            if (payload.containsKey("phone")) p.setPhone((String) payload.get("phone"));
            
            if (payload.containsKey("dob") && payload.get("dob") != null) {
                String dobStr = payload.get("dob").toString();
                if (!dobStr.isEmpty()) {
                    p.setDob(LocalDate.parse(dobStr));
                }
            }
            
            if (payload.containsKey("gender") && payload.get("gender") != null) {
                String genderStr = payload.get("gender").toString();
                if (!genderStr.isEmpty()) {
                    p.setGender(Patient.Gender.valueOf(genderStr));
                }
            }
            
            patientRepository.save(p);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
