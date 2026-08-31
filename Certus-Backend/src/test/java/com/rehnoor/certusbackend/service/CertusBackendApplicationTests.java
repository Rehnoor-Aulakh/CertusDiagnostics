package com.rehnoor.certusbackend.service;

import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class KnowledgeBaseReaderServiceTest {

    private KnowledgeBaseReaderService readerService = new KnowledgeBaseReaderService();

    @Test
    void testLoadCleanDocuments() {
        List<Document> docs = readerService.loadCleanDocuments();

        assertFalse(docs.isEmpty(), "Documents should not be empty");

        Document firstDoc = docs.get(0);
        System.out.println("--- Sample Document Metadata ---");
        firstDoc.getMetadata().forEach((k, v) -> System.out.println(k + ": " + v));

        System.out.println("\n--- First 200 characters of Body ---");
        System.out.println(firstDoc.getText().substring(0, Math.min(200, firstDoc.getText().length())));

        assertNotNull(firstDoc.getMetadata().get("category"));
        assertNotNull(firstDoc.getMetadata().get("topic"));
    }
}