package com.rehnoor.certusbackend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rehnoor.certusbackend.dto.history.*;
import com.rehnoor.certusbackend.enums.HealthTrendStatus;
import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.model.Report;
import com.rehnoor.certusbackend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

import lombok.Data;

@Service
public class HealthHistoryService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private static final double WARNING_ZONE_PERCENT= 0.1;
    private static final double EPSILON = 1e-6;

    @Data
    public static class ReferenceRange {
        Double lower;
        Double upper;
        boolean lowerInclusive;
        boolean upperInclusive;
    }

    public HealthHistoryResponse buildHistory(String email){
        List<Report> reports = reportRepository.findByPatientId_EmailIgnoreCaseOrderByReportDateAsc(email);
        Map<String, TestHistoryDTO> groupedTests = groupTests(reports);
        // get the statuses for the grouped tests
        for(TestHistoryDTO timeline: groupedTests.values()){
            determineStatus(timeline);
        }
        HealthHistoryResponse response = new HealthHistoryResponse();
        response.setSummary(buildSummary(groupedTests));
        response.setGraphs(buildGraphs(groupedTests));
        return response;
    }
    private SummaryDTO buildSummary(Map<String, TestHistoryDTO> timelines) {
        SummaryDTO summary = new SummaryDTO();
        int classified = 0;
        // Iterate over every timeline
        for(TestHistoryDTO timeline: timelines.values()){
            if (timeline.getStatus() == null) {
                continue;
            }
            classified++;
            switch (timeline.getStatus()){
                case STABLE_NORMAL -> {
                    summary.setStableNormal(summary.getStableNormal() + 1);
                    summary.setHealthScore(summary.getHealthScore() + 1);
                }
                case ABNORMAL -> {
                    summary.setAbnormal(summary.getAbnormal() + 1);
                    summary.setHealthScore(summary.getHealthScore() - 1);
                }
                case NEEDS_ATTENTION -> {
                    summary.setNeedsAttention(summary.getNeedsAttention() + 1);
                }
                case IMPROVING -> {
                    summary.setImproving(summary.getImproving() + 1);
                    summary.setHealthScore(summary.getHealthScore() + 1);
                }
                case RECOVERED -> {
                    summary.setRecovered(summary.getRecovered() + 1);
                    summary.setHealthScore(summary.getHealthScore() + 2);
                }
                case WORSENING -> {
                    summary.setWorsening(summary.getWorsening() + 1);
                    summary.setHealthScore(summary.getHealthScore() - 2);
                }
                default -> {
                }
            }
        }
        summary.setTotalTests(classified);
        summary.setHealthScore(normalizeHealthScore(summary.getHealthScore(), summary.getTotalTests()));
        summary.setHeading(generateHeadings(summary));
        return summary;
    }
    private String generateHeadings(SummaryDTO summary){
        if (summary.getWorsening() > 0) {
            return summary.getWorsening() == 1
                    ? "1 test is worsening compared to your previous report."
                    : summary.getWorsening() + " tests are worsening compared to your previous report.";
        }
        if (summary.getNeedsAttention() > 0) {
            return summary.getNeedsAttention() == 1
                    ? "1 test is approaching the normal range boundary."
                    : summary.getNeedsAttention() + " tests are approaching their normal range boundaries.";
        }
        if (summary.getAbnormal() > 0) {
            return summary.getAbnormal() == 1
                    ? "1 test remains outside the normal range."
                    : summary.getAbnormal() + " tests remain outside the normal range.";
        }
        if (summary.getRecovered() > 0) {
            return summary.getRecovered() == 1
                    ? "Great news! One test has returned to the normal range."
                    : "Great news! " + summary.getRecovered() + " tests have returned to the normal range.";
        }
        if (summary.getImproving() > 0) {
            return summary.getImproving() == 1
                    ? "One abnormal test is moving toward the normal range."
                    : summary.getImproving() + " abnormal tests are moving toward the normal range.";
        }
        return "All tracked tests are currently within their normal ranges.";
    }
    private int normalizeHealthScore(int rawScore, int totalTests){
        if(totalTests==0){
            return 0;
        }
        int minScore = -2*totalTests;
        int maxScore = 2*totalTests;
        double normalized = ((double)(rawScore-minScore)/(maxScore-minScore))*100.0;
        return (int) Math.round(normalized);
    }
    private String normalizeTestName(String name) {
        if (name == null) return null;
        // Trim, collapse multiple spaces, fix spacing around parentheses, and uppercase
        return name.trim().replaceAll("\\s+", " ").replaceAll("\\s*\\(", "(").toUpperCase();
    }

    private String normalizeCategory(String category) {
        if (category == null) return null;
        return category.trim().toUpperCase();
    }

    private Map<String, TestHistoryDTO> groupTests(List<Report> reports){
        Map<String, TestHistoryDTO> grouped = new LinkedHashMap<>();
        for(Report report: reports){
            // this report's test data gets converted to a List of ParsedTestDTO
            List<ParsedTestDTO> tests = parseTests(report.getTestsData());
            // for every test in this report
            for(ParsedTestDTO test: tests){
                String normalizedName = normalizeTestName(test.getTestName());
                String normalizedCategory = normalizeCategory(test.getCategory());
                if (normalizedName == null) continue;

                TestHistoryDTO timeline = grouped.computeIfAbsent(
                        normalizedName,
                        key -> {
                            TestHistoryDTO t = new TestHistoryDTO();
                            t.setTestName(test.getTestName() != null ? test.getTestName().trim() : null);
                            t.setCategory(test.getCategory() != null ? test.getCategory().trim() : null);
                            t.setUnit(test.getUnit());
                            t.setReferenceRange(test.getReferenceRange());
                            t.setParsedRange(parseReferenceRange(test.getReferenceRange()));
                            return t;
                        }
                );
                TimelinePointDTO point = new TimelinePointDTO();
                point.setDate(LocalDate.from(report.getReportDate()));
                point.setValue(parseValue(test.getValue()));
                point.setAbnormal(Boolean.TRUE.equals(test.getAbnormal()));
                timeline.getTimeline().add(point);

            }

        }
        for (TestHistoryDTO timeline : grouped.values()) {
            timeline.getTimeline().sort(Comparator.comparing(TimelinePointDTO::getDate));
        }
        return grouped;
    }
    private Double parseValue(String value){
        if(value==null || value.isBlank()){
            return null;
        }
        try{
            return Double.parseDouble(value);
        } catch(NumberFormatException e){
            return null;
        }
    }
    private ReferenceRange parseReferenceRange(String range){
        if(range==null || range.isBlank()){
            return null;
        }
        range = range.trim();
        ReferenceRange ref = new ReferenceRange();
        try{
            // "0.54-5.30"
            if(range.contains("-")){
                String[] parts = range.split("-");
                ref.lower = Double.parseDouble(parts[0].trim());
                ref.upper = Double.parseDouble(parts[1].trim());
                ref.lowerInclusive = true;
                ref.upperInclusive = true;
                return ref;
            }
            if(range.startsWith("<=")){
                ref.upper = Double.parseDouble(range.substring(2).trim());
                ref.upperInclusive = true;
                return ref;
            }
            if(range.startsWith("<")){
                ref.upper = Double.parseDouble(range.substring(1).trim());
                ref.upperInclusive=false;
                return ref;
            }
            if(range.startsWith(">=")){
                ref.lower = Double.parseDouble(range.substring(2).trim());
                ref.lowerInclusive = true;
                return ref;
            }
            if(range.startsWith(">")){
                ref.lower = Double.parseDouble(range.substring(1).trim());
                ref.lowerInclusive = false;
                return ref;
            }
        } catch (NumberFormatException ignored){}
        return null;
    }
    // if reference range is unavailable, it should not be shown, because we should avoid false positive -- check this
    private Boolean isNormal(double value, ReferenceRange range){
        if(range==null) return false;
        if(range.lower != null){
            if(range.lowerInclusive){
                // even lower than normal range
                if(value <  range.lower-EPSILON) return false;
            } else{
                if(value <= range.lower+EPSILON) return false;
            }
        }
        if(range.upper != null){
            if(range.upperInclusive){
                if(value> range.upper+EPSILON) return false;
            } else{
                if(value >= range.upper - EPSILON) return false;
            }
        }
        return true;
    }
    private Boolean isNearBoundary(double value, ReferenceRange range){
        if(!isNormal(value, range)) return false;
        // if the either lower or upper is unavailable, it can still be near the boundary while being normal- so we need to fix that
        if(range.lower!=null && range.upper!=null) {
            double width = range.upper - range.lower;
            double warning = width * WARNING_ZONE_PERCENT;
            return value <= range.lower+warning || value >= range.upper-warning;
        }
        if(range.lower != null){
            return value <= range.lower + Math.abs(range.lower*WARNING_ZONE_PERCENT);
        }
        if(range.upper != null){
            return value >= range.upper - Math.abs(range.upper*WARNING_ZONE_PERCENT);
        }
        return false;
    }
    private double distanceFromNormal(double value, ReferenceRange range){
        if(range==null) return 0;
        if(isNormal(value, range)){
            return 0;
        }
        if(range.lower!=null && value<range.lower){
            return range.lower-value;
        }
        if(range.upper!=null && value>range.upper){
            return value- range.upper;
        }
        return 0;
    }
    private List<ParsedTestDTO> parseTests(String json){
        if(json==null || json.isBlank()){
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<ParsedTestDTO>>() {});

        } catch(Exception e){
            System.err.println("Failed to parse tests data: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
    private void determineStatus(TestHistoryDTO timeline){
        if(timeline.getParsedRange() ==null){
            timeline.setStatus(null);
            return;
        }
        if(timeline.getTimeline().isEmpty()){
            timeline.setStatus(null);
            return;
        }
        TimelinePointDTO latest = timeline.getTimeline().get(timeline.getTimeline().size()-1);
        if (latest.getValue() == null) {
            timeline.setStatus(null);
            return;
        }
        // if there is just one report- we cant infer the trend
        if(timeline.getTimeline().size()==1){
            if(isNormal(latest.getValue(), timeline.getParsedRange())){
                timeline.setStatus(isNearBoundary(latest.getValue(), timeline.getParsedRange()) ? HealthTrendStatus.NEEDS_ATTENTION : HealthTrendStatus.STABLE_NORMAL);

            } else{
                timeline.setStatus(HealthTrendStatus.ABNORMAL);
            }
            return;
        }
        TimelinePointDTO previous = timeline.getTimeline().get(timeline.getTimeline().size()-2);
        if (previous.getValue() == null) {
            timeline.setStatus(null);
            return;
        }
        boolean currentNormal = isNormal(latest.getValue(), timeline.getParsedRange());
        boolean previousNormal = isNormal(previous.getValue(), timeline.getParsedRange());
        double currentDistance = distanceFromNormal(latest.getValue(), timeline.getParsedRange());
        double previousDistance = distanceFromNormal(previous.getValue(), timeline.getParsedRange());

        // CASE 1: Previous abnormal -> Current Normal (Recovered)
        if(currentNormal && !previousNormal) {
            timeline.setStatus(HealthTrendStatus.RECOVERED);
            return;
        }

        // CASE 2: Previous normal -> Current Normal (either stable normal or needs attention)
        if(currentNormal && previousNormal){
            timeline.setStatus(isNearBoundary(latest.getValue(), timeline.getParsedRange()) ? HealthTrendStatus.NEEDS_ATTENTION : HealthTrendStatus.STABLE_NORMAL);
            return;
        }

        // CASE 3: Previous abnormal -> Current abnormal -> need to compare distance
        if(!currentNormal && !previousNormal){
            // since the distance always becomes more positive on worsening, we want it small
            if(currentDistance < previousDistance-EPSILON){
                timeline.setStatus(HealthTrendStatus.IMPROVING);
            }
            else if(currentDistance > previousDistance+EPSILON){
                timeline.setStatus(HealthTrendStatus.WORSENING);
            }
            else{
                timeline.setStatus(HealthTrendStatus.ABNORMAL);
            }
            return;
        }

        // CASE 4: Previous Normal -> Current Abnormal
        timeline.setStatus(HealthTrendStatus.WORSENING);
        return;

    }
    private List<TestHistoryDTO> buildGraphs(Map<String, TestHistoryDTO> timelines){
        List<TestHistoryDTO> graphs = new ArrayList<>();
        for(TestHistoryDTO timeline: timelines.values()){
            if(timeline.getStatus()==null){
                continue;
            }
            if(timeline.getTimeline().isEmpty()){
                continue;
            }
            graphs.add(timeline);
        }
        graphs.sort(Comparator.comparingInt((TestHistoryDTO t) -> getGraphPriority(t.getStatus())).thenComparing(TestHistoryDTO::getCategory).thenComparing(TestHistoryDTO::getTestName));
        return graphs;
    }
    private int getGraphPriority(HealthTrendStatus status) {
        return switch (status) {
            case WORSENING -> 1;
            case ABNORMAL -> 2;
            case NEEDS_ATTENTION -> 3;
            case IMPROVING -> 4;
            case RECOVERED -> 5;
            case STABLE_NORMAL -> 6;
            default -> Integer.MAX_VALUE;
        };

    }
}
