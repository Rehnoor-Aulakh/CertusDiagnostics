package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.chatbot.ChatRequestDTO;
import com.rehnoor.certusbackend.dto.chatbot.ChatResponseDTO;
import com.rehnoor.certusbackend.prompt.ChatPromptBuilder;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private ChatPromptBuilder promptBuilder;

    ChatMemory chatMemory = MessageWindowChatMemory.builder().build();


    public ChatResponseDTO chatResponse(ChatRequestDTO request) {

        String response = chatClient
                .prompt()
                .user(request.getMessage())
                .system(promptBuilder.systemPrompt())
                .advisors(a -> a
                        .advisors(
                                MessageChatMemoryAdvisor.builder(chatMemory)
                                        .build()
                        )
                        .param(ChatMemory.CONVERSATION_ID, request.getConversationId())
                )
                .call()
                .content();
        
        return ChatResponseDTO.builder()
                .conversationId(request.getConversationId())
                .answer(response)
                .build();
    }
}
