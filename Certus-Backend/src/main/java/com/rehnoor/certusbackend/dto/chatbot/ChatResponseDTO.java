package com.rehnoor.certusbackend.dto.chatbot;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChatResponseDTO {
    private String conversationId;
    private String answer;
    private List<ReferenceDTO> references;
    private List<String> suggestedQuestions;

}
