package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    // For traditional credential login
    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByGoogleId(String googleId);

    Optional<Patient> findByNameIgnoreCase(String name);

    //check if a patient exists before registering
    boolean existsByEmail(String email);

    @Query(value = "SELECT COUNT(*) FROM patients WHERE EXTRACT(MONTH FROM created_at)=:month AND EXTRACT(YEAR FROM created_at)=:year", nativeQuery = true)
    long countPatientsByMonthAndYear(@Param("month") int month, @Param("year") int year);

    Optional<Patient> findByEmailIgnoreCase(String email);
}
