package com.rehnoor.certusbackend.config;

import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.repository.PatientRepository;
import com.rehnoor.certusbackend.service.HealthHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class HealthHistorySeederRunner implements CommandLineRunner {
    private final PatientRepository patientRepository;
    private final HealthHistoryService healthHistoryService;

    @Value("${app.historyseeder.enabled:false}")
    private boolean historySeederEnabled;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if(!historySeederEnabled) {
            System.out.println("⚠️ Health History Seeder is disabled. Skipping.");
            return;
        }
        List<Patient> patients = patientRepository.findAll();
        System.out.println("🚀 Building health history cache for " + patients.size() + " patients...");
        int processed = 0;
        // loop for each patient
        for (Patient patient : patients) {
            try {
                healthHistoryService.rebuildHealthHistory(patient.getEmail());
                processed++;
                System.out.printf("✅ %d/%d %s%n",
                        processed,
                        patients.size(),
                        patient.getEmail());
            } catch (Exception e) {
                System.err.printf("❌ Failed for %s : %s%n",
                        patient.getEmail(),
                        e.getMessage());
            }
        }
        System.out.println("=========================================");
        System.out.println("Health History seeding completed.");
        System.out.println("Successfully processed: " + processed + "/" + patients.size());
        System.out.println("=========================================");
    }
}
