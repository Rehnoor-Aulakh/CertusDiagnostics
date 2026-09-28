package com.rehnoor.certusbackend.service.rag;

import com.rehnoor.certusbackend.dto.chatbot.AiReportContext;
import com.rehnoor.certusbackend.service.AiReportService;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ChatReportTools {
    private static final String PATIENT_ID_KEY = "patientId";

    private final AiReportService aiReportService;

    public ChatReportTools(AiReportService aiReportService) {
        this.aiReportService = aiReportService;
    }

    @Tool(
            name = "get_latest_reports",
            description = """
                    Retrieve the patient's most recent diagnostic reports.
                    
                    Use this when the user asks about:
                    - thier latest report
                    - their last report
                    - their last N reports
                    - their most recent N reports
                    - comparisons involvign their most recent reports
                    
                    The count must represent the number of reports required.
                    Do not use this tool for a time -based request such as 'reports from the last 6 months'.
                    """
    )
    public List<AiReportContext> getLatestReports(@ToolParam(description = "Number of most recent reports to retrieve") int count, ToolContext toolContext) {
        Long patientId = getPatientId(toolContext);

        return aiReportService.getLatestReportsByPatientId(patientId, count);
    }

    @Tool(
            name = "get_reports_from_last_months",
            description = """
                    Retrieve all of the patient's diagnostic reports from the specified number of months before today.
                    
                    Use this when the user asks about:
                    - reports from the last N months
                    - reports over the last N months
                    - changes or trends over a time period
                    - their history during the previous N months
                    
                    The months parameter represents a relative period ending today.
                    Do not use this tool when the user asks for a specific number of recent reports.
                    """
    )
    public List<AiReportContext> getReportsFromLastMonths(@ToolParam(description = "Number of months of report history to retrieve") int months, ToolContext toolContext) {
        Long patientId = getPatientId(toolContext);
        return aiReportService.getReportsFromLastMonthsByPatientId(patientId, months);
    }

    private Long getPatientId(ToolContext toolContext) {
        Object value = toolContext.getContext().get(PATIENT_ID_KEY);

        if(value == null) {
            throw  new IllegalStateException("Patient ID is missing from AI tool context");
        }
        if(value instanceof  Long patientId) {
            return patientId;
        }
        return Long.valueOf(value.toString());
    }
}
