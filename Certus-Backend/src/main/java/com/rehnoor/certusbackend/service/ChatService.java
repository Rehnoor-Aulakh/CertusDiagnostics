package com.rehnoor.certusbackend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private ChatPromptBuilder promptBuilder;

    @Autowired
    private VectorStore vectorStore;

    @Autowired
    private ObjectMapper objectMapper;

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

        String answer = response;
        List<String> suggestedQuestions = new ArrayList<>();

        try {
            int startIndex = response.indexOf('{');
            int endIndex = response.lastIndexOf('}');
            if (startIndex != -1 && endIndex != -1 && startIndex <= endIndex) {
                String jsonStr = response.substring(startIndex, endIndex + 1);
                JsonNode jsonResponse = objectMapper.readTree(jsonStr);

                if (jsonResponse.has("answer")) {
                    answer = jsonResponse.get("answer").asText();
                }

                if (jsonResponse.has("suggestedQuestions") && jsonResponse.get("suggestedQuestions").isArray()) {
                    for (JsonNode node : jsonResponse.get("suggestedQuestions")) {
                        suggestedQuestions.add(node.asText());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to parse JSON response from LLM: " + e.getMessage());
        }

        return ChatResponseDTO.builder()
                .conversationId(request.getConversationId())
                .answer(answer)
                .suggestedQuestions(suggestedQuestions)
                .build();
    }
}
