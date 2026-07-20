package com.rehnoor.certusbackend.repository;

import com.rehnoor.certusbackend.model.AdminOtp;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.Optional;

@Repository
public interface AdminOtpRepository extends JpaRepository<AdminOtp, Long> {
    Optional<AdminOtp> findByEmailAndUsedFalse(String email, String otp);

    // Cache eviction query to purse expired tokens
    @Modifying  // insert, update, delete instead of lookup
    @Transactional
//    @Transactional: Instructs the database to wrap this operation in an isolated transaction. If something crashes mid-deletion, it rolls back automatically to protect your database state.
    @Query("DELETE FROM AdminOtp o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now")ZonedDateTime now);
}
