package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.model.Report;
import com.rehnoor.certusbackend.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Objects;
import java.util.stream.Stream;

@Service
public class ReportService {
    @Autowired
    private ReportRepository reportRepository;

    // a function to find the minimum of all the 4 dates stored, so that the person can get the most accurate date
    public ZonedDateTime getEffectiveReportDate(Report report) {
        return Stream.of(
                report.getSampleCollectedOn(),
                report.getSampleReceivedOn(),
                report.getReportDate(),
                report.getReportReleasedOn()
        ).filter(Objects::nonNull).min(ZonedDateTime::compareTo).orElse(null);
    }

}
