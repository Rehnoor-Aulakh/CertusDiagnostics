package com.rehnoor.certusbackend.dto.chatbot;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequestDTO {
    private String conversationId;
    private String message;
    private ContextType contextType;
    private Integer customReportCount;
}
