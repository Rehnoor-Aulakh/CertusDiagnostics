package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.service.rag.KnowledgeBaseReaderService;
import com.rehnoor.certusbackend.service.rag.MedicalCorpusChunkerService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;

public class MedicalCorpusChunkerServiceTest {

    private KnowledgeBaseReaderService readerService = new KnowledgeBaseReaderService();

    private MedicalCorpusChunkerService chunkerService = new MedicalCorpusChunkerService();

    @Test
    void testChunkingAndEnrichment() {
        List<Document> rawDocs = readerService.loadCleanDocuments();
        List<Document> chunks = chunkerService.chunkAndEnrich(rawDocs);

        assertFalse(chunks.isEmpty(), "Chunks should not be empty");
        System.out.println("Total Generated Chunks: " + chunks.size() );

        Document sampleDoc = chunks.get(0);
        System.out.println("-------Sample Chunk Metadata----------");
        sampleDoc.getMetadata().forEach((k,v) -> System.out.println(k + " : " + v));
        System.out.println("--- Sample Chunk Text Content ---");
        System.out.println(sampleDoc.getText());
    }
}
