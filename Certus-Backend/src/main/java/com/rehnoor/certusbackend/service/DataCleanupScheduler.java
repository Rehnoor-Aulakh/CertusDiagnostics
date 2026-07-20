package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.repository.AdminOtpRepository;
import com.rehnoor.certusbackend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
public class DataCleanupScheduler {
    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AdminOtpRepository adminOtpRepository;

    // Runs automatically every 30 minutes to clean everything at once
    @Scheduled(cron = "0 */30 * * * *")
    public void executeSystemMaintainencePurge(){
        ZonedDateTime now = ZonedDateTime.now();

        // 1. Clear out transient OTP Cache
        adminOtpRepository.deleteExpiredOtps(now);

        // 2. Calculate the 12-hour static cutoff mark dynamically in memory
        ZonedDateTime twelveHoursAgo = now.minusHours(12);

        // 3. Drop the pending requests that were before than 12 hours ago
        adminRepository.deleteExpiredPendingRequests(twelveHoursAgo);

    }

}
