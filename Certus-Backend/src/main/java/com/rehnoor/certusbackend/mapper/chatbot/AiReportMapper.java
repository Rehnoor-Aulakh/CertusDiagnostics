package com.rehnoor.certusbackend.mapper.chatbot;

import com.rehnoor.certusbackend.dto.chatbot.AiReportContext;
import com.rehnoor.certusbackend.model.Report;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AiReportMapper {

    public AiReportContext toContext(Report report) {
        return AiReportContext.builder()
                .reportId(report.getReportId())
                .testName(report.getTestName())
                .reportDate(report.getReportDate())
                .testsIncluded(report.getTestsIncluded())
                .testsData(report.getTestsData())
                .abnormalData(report.getAbnormalData())
                .build();
    }

    public List<AiReportContext> toContext(List<Report> reports) {
        return reports.stream()
                .map(this::toContext)
                .toList();
    }

}
