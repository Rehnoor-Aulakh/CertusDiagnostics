package com.rehnoor.certusbackend.prompt;

import com.rehnoor.certusbackend.dto.chatbot.ChatRequestDTO;
import com.rehnoor.certusbackend.model.Report;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ChatPromptBuilder {

    public String buildPrompt(ChatRequestDTO request, List<Report> reports, List<Document> retrievedContext) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("""
            You are Certus AI Assistant, Certus Diagnostics does blood tests for patients and shares reports with them.
         
            Your job is to explain medical reports in a clear,
            concise, and medically accurate way.

            Rules:

            - Answer only using the supplied report context.
            - Never invent values.
            - If the answer cannot be found, clearly say so.
            - Format every answer in Markdown.
            - Explain medical terminology in simple language.
            - When comparing reports, clearly indicate whether
              values improved, worsened, or remained stable.
            """);
        prompt.append("\n\n");
        prompt.append("User Question:\n");
        prompt.append(request.getMessage());

        prompt.append("\n\n");

        prompt.append("Relevant Report Context:\n");

        for(Document doc: retrievedContext) {
            prompt.append(doc.getText());
            prompt.append("\n\n");
        }
        return prompt.toString();
    }
}
