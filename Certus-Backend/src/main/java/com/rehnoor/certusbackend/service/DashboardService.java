package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.DashboadDataResponse;
import com.rehnoor.certusbackend.dto.RecentTestDTO;
import com.rehnoor.certusbackend.repository.PatientRepository;
import com.rehnoor.certusbackend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {
    @Autowired
    PatientRepository patientRepository;

    @Autowired
    ReportRepository reportRepository;

    public DashboadDataResponse.DashboardData getMetrics(){
        DashboadDataResponse.DashboardData stats = new DashboadDataResponse.DashboardData();

        // 1. Map core metrics variables
        stats.setTotalPatients(patientRepository.count());
        stats.setTestsToday(reportRepository.countTestsToday());
        stats.setPendingReports(reportRepository.countPendingReports());
        stats.setRevenueToday(reportRepository.getRevenueToday());
        stats.setRevenueThisWeek(reportRepository.getRevenueThisWeek());
        stats.setRevenueThisMonth(reportRepository.getRevenueThisMonth());
        stats.setTestsThisWeek(reportRepository.countTestsThisWeek());
        stats.setTestsThisMonth(reportRepository.countTestsThisMonth());

        // 2. Fetch and Convert Object Arrays to Type-Safe Recent Activity DTO List
        List<Object[]> rawRecent = reportRepository.findRecentTestsNative();
        List<RecentTestDTO> recentTests = new ArrayList<>();
        for (Object[] row : rawRecent) {
            Object rawTimestamp = row[3];
            LocalDateTime createdAt;

            if (rawTimestamp == null) {
                createdAt = null;
            } else if (rawTimestamp instanceof java.sql.Timestamp) {
                createdAt = ((java.sql.Timestamp) rawTimestamp).toLocalDateTime();
            } else if (rawTimestamp instanceof java.time.Instant) {
                createdAt = LocalDateTime.ofInstant((java.time.Instant) rawTimestamp, ZoneId.systemDefault());
            } else if (rawTimestamp instanceof LocalDateTime) {
                createdAt = (LocalDateTime) rawTimestamp;
            } else {
                throw new IllegalStateException("Unexpected type for timestamp: " + rawTimestamp.getClass().getName());
            }

            Long hoursAgo = (row[5] != null) ? ((Number) row[5]).longValue() : 0L;

            recentTests.add(new RecentTestDTO(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    (String) row[2],
                    createdAt,
                    (String) row[4],
                    hoursAgo
            ));
        }
        stats.setRecentTests(recentTests);

        // 3. Dynamic Monthly growth calculation engine
        LocalDate now = LocalDate.now();
        LocalDate prev = now.minusMonths(1);

        long currPatients = patientRepository.countPatientsByMonthAndYear(now.getMonthValue(), now.getYear());
        long prevPatients = patientRepository.countPatientsByMonthAndYear(prev.getMonthValue(), prev.getYear());

        long currTests = stats.getTestsThisMonth();
        long prevTests = reportRepository.countTestsByMonthAndYear(prev.getMonthValue(), prev.getYear());

        double currRevenue = stats.getRevenueThisMonth();
        double prevRevenue = reportRepository.getRevenueByMonthAndYear(prev.getMonthValue(), prev.getYear());

        long currPending = stats.getPendingReports();
        long prevPending = reportRepository.countPendingReportsByMonthAndYear(prev.getMonthValue(), prev.getYear());

        Map<String, Double> growthMap = new HashMap<>();
        growthMap.put("patients", calculateGrowth(currPatients, prevPatients));
        growthMap.put("tests", calculateGrowth(currTests, prevTests));
        growthMap.put("revenue", calculateGrowth(currRevenue, prevRevenue));
        growthMap.put("pendingReports", calculateGrowth(currPending, prevPending));

        stats.setMonthlyGrowth(growthMap);
        return stats;
    }

    private double calculateGrowth(double current, double previous){
        if (previous <= 0) return current > 0 ? 100.0 : 0.0;
        double percentage= (current-previous)/previous * 100;
        return BigDecimal.valueOf(percentage).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
