package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.dto.chatbot.ChatRequestDTO;
import com.rehnoor.certusbackend.dto.chatbot.ChatResponseDTO;
import com.rehnoor.certusbackend.prompt.ChatPromptBuilder;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private ChatPromptBuilder promptBuilder;

    @Autowired
    private VectorStore vectorStore;

    ChatMemory chatMemory = MessageWindowChatMemory.builder().build();


    public ChatResponseDTO chatResponse(ChatRequestDTO request) {

        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.builder().query(request.getMessage()).topK(5).build()
        );

        String context = promptBuilder.buildContextString(similarDocuments);
        String systemText = promptBuilder.systemPrompt() + "\n\n" + context;

        String response = chatClient
                .prompt()
                .user(request.getMessage())
                .system(systemText)
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
