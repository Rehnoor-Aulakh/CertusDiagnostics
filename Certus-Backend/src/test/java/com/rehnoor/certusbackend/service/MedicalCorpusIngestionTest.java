package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.service.rag.MedicalCorpusIngestionRunner;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5434/medical_vectors",
        "spring.datasource.username=postgres",
        "spring.datasource.password=1234",
        "spring.ai.google.genai.embedding.text.dimensions=768",
        "spring.ai.vectorstore.pgvector.dimensions=768",
        "spring.jpa.hibernate.ddl-auto=update"
})
public class MedicalCorpusIngestionTest {

    @Autowired
    private MedicalCorpusIngestionRunner ingestionRunner;

    @Test
    void executeIngestion() {
        ingestionRunner.runIngestion();
    }
}
