package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.model.Admin;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);

    Optional<Admin> findByEmailIgnoreCase(String email);

    Optional<Admin> findByGoogleId(String googleId);

    Optional<Admin> findByApprovalToken(String token);

    // The Fix: Purge admins whose status is 'PENDING' and created time is older than the target cut-off
    @Modifying
    @Transactional
    @Query("DELETE FROM Admin a WHERE a.status='PENDING' and a.createdAt < :cutoffTime")
    void deleteExpiredPendingRequests(@Param("cutoffTime")ZonedDateTime cutoffTime);
}
