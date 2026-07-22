package com.rehnoor.certusbackend.dto.history;

import lombok.Data;

import java.util.List;

@Data
public class HealthHistoryResponse {
    private SummaryDTO summary;
    private List<TestHistoryDTO> graphs;

}
