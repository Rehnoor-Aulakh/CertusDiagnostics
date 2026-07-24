package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.model.HealthHistory;
import com.rehnoor.certusbackend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HealthHistoryRepository extends JpaRepository<HealthHistory, Long> {
    HealthHistory findByPatient_EmailIgnoreCase(String email);

    Optional<HealthHistory> findByPatient(Patient patient);
}
