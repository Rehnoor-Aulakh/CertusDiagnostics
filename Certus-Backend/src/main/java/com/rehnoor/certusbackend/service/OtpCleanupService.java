package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.repository.AdminOtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
public class OtpCleanupService {
    @Autowired
    private AdminOtpRepository adminOtpRepository;

    // This annotation tells spring boot to wake up and run this method automatically, every 30 minutes
    @Scheduled(cron = "0 */30 * * * *")
    public void cleanExpiredTokensAutomatically(){
        // We calculate the current time in java
        ZonedDateTime currentDatabaseTime = ZonedDateTime.now();
        //We pass the current time to the repository method
        adminOtpRepository.deleteExpiredOtps(currentDatabaseTime);
        System.out.println("Expired OTP cache cleared successfully at: " + currentDatabaseTime);
    }
}
