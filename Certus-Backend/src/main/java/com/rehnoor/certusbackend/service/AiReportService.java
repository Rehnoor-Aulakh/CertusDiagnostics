package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.chatbot.AiReportContext;
import com.rehnoor.certusbackend.mapper.chatbot.AiReportMapper;
import com.rehnoor.certusbackend.model.Patient;
import com.rehnoor.certusbackend.model.Report;
import com.rehnoor.certusbackend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;

/// Responsible specifically for report retrieval requested by AI

@Service
@RequiredArgsConstructor
public class AiReportService {
    private static final int MAX_REPORTS = 20;
    private static final int MAX_MONTHS = 12;

    private final ReportRepository reportRepository;
    private final AiReportMapper aiReportMapper;

    public List<AiReportContext> getLatestReportsByPatientId(Long patientId, int count) {
        if(count < 1 || count > MAX_REPORTS) {
            throw new IllegalArgumentException("Report Count must be between 1 and " + MAX_REPORTS);
        }
        List<Report> reports = reportRepository.findLatestReportsByPatientId(patientId, PageRequest.of(0, count));
        return aiReportMapper.toContext(reports);
    }

    public List<AiReportContext> getReportsFromLastMonthsByPatientId(Long patientId, int months) {
        if(months < 1 || months > MAX_MONTHS) {
            throw new IllegalArgumentException("Time period must be between 1 and " + MAX_MONTHS + " months");
        }
        ZonedDateTime startTime = ZonedDateTime.now().minusMonths(months);
        List<Report> reports =  reportRepository.findReportsFromDateByPatientId(patientId, startTime);
        return aiReportMapper.toContext(reports);
    }

}
