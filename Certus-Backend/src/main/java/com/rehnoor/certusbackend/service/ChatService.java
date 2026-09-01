package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.chatbot.ChatRequestDTO;
import com.rehnoor.certusbackend.dto.chatbot.ChatResponseDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    @Autowired
    private ChatClient chatClient;


    public ChatResponseDTO chatResponse(ChatRequestDTO request) {
        
        return ChatResponseDTO.builder()
                .conversationId(request.getConversationId())
                .answer(request.getMessage())
                .build();
    }
}
