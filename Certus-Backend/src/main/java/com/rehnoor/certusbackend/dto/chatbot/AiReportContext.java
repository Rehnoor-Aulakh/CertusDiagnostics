package com.rehnoor.certusbackend.dto.chatbot;

import lombok.Builder;
import lombok.Getter;

import java.time.ZonedDateTime;

@Getter
@Builder
public class AiReportContext {
    private Long reportId;
    private String testName;
    private ZonedDateTime reportDate;
    private String testsIncluded;
    private String testsData;
    private String abnormalData;
}
