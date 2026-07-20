package com.rehnoor.certusbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DashboadDataResponse {
    private boolean success = true;
    private DashboardData data;

    @Getter
    @Setter
    public static class DashboardData{
        private Long totalPatients;
        private Long testsToday;
        private Long pendingReports;
        private double revenueToday;
        private double revenueThisWeek;
        private double revenueThisMonth;
        private Long testsThisWeek;
        private Long testsThisMonth;

        List<RecentTestDTO> recentTests;
        private Map<String, Double> monthlyGrowth;

    }


}
