package com.rehnoor.certusbackend.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.SearchResult;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.ai.vectorstore.SearchRequest;

import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.ai.google.genai.project-id=173006060265",
        "spring.ai.google.genai.embedding.project-id=173006060265",
        "spring.ai.google.genai.embedding.location=us-central1",
        "spring.ai.google.genai.embedding.api-key=${GOOGLE_GEMINI_API_KEY}",
        "spring.ai.google.genai.embedding.text.dimensions=768",
        "spring.ai.vectorstore.pgvector.dimensions=768",
        "spring.sql.init.mode=always",
        "spring.config.import=optional:file:.env[.properties]"
})
public class RagComponentsSanityTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg17");


    @Autowired
    private ChatModel chatModel;

    @Autowired
    private EmbeddingModel embeddingModel;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private VectorStore vectorStore;

    @Test
    @Order(1)
    @DisplayName("Test 1: Verify Google Gemini LLM Chat Call")
    void testGeminiChatModel() {
        System.out.println("\n--------RUNNING TEST 1: Gemini Chat API--------");
        String response = chatModel.call("Respond with only the word 'PONG'");
        System.out.println("LLM Response: " + response);

        assertNotNull(response);
        assertTrue(response.toLowerCase().contains("pong"), "Response should contain PONG");
    }

    @Test
    @Order(2)
    @DisplayName("Test 2: Verify Google Gemini Embedding Model (text-embedding-004)")
    void testGeminiEmbeddingModel() {
        System.out.println("\n------RUNNING TEST 2: Gemini Embedding API--------");
        float[] vector = embeddingModel.embed("Testing diabetes medical embeddings");

        assertNotNull(vector);
        System.out.println("Vector generated successfully. Dimensions: " + vector.length);
        assertEquals(768, vector.length, "Embedding dimension should be 768");
    }

    @Test
    @Order(3)
    @DisplayName("Test 3: Verify PostgreSQL Connection and pgvector Extension")
    void testPostgresAndPgVectorExtension() {
        System.out.println("\n-------RUNNING TEST 3: Postgres & Vector Extension------");

        // 1. Check basic DB Connection
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        assertEquals(1, result);
        System.out.println("Postgres Connection: OK");

        // 2. Check if pgvector extension is installed
        Integer vectorExtensionInstalled = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector'", Integer.class);

        System.out.println("pgvector extension count: " + vectorExtensionInstalled);
        assertTrue(vectorExtensionInstalled != null && vectorExtensionInstalled > 0,
                "pgvector extension is not installed in the database! Run 'CREATE EXTENSION vector;' in postgres.");
    }

    @Test
    @Order(4)
    @DisplayName("Test 4: Verify VectorStore (Add Document -> Embed -> PGvector Insert -> Similarity Search)")
    void testVectorStoreWorkflow() {
        System.out.println("\n-----RUNNING TEST 4: Full VectorStore Roundtrip----");

        // Create a unique document
        String docId = "test-cardio-123";
        Document doc = new Document("Elevated LDL cholesterol is strongly linked to arterial plaque buildup and cardiovascular disease.", Map.of("category", "cardiovascular", "topic", "atherosclerosis", "test_id", docId));

        // 1. Store and embed
        vectorStore.add(List.of(doc));
        System.out.println("Test document embedded and stored in PostgreSQL vector_store table.");

        // 2. Similarity Search
        List<Document> results = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query("What causes arterial plaque from bad cholesterol?")
                        .topK(5)
                        .similarityThreshold(0.3)
                        .build()
        );
        assertFalse(results.isEmpty(), "Similarity search should return at least 1 document");
        System.out.println("Retrieved top match: " + results.get(0).getText());
        System.out.println("Retrieved metadata: " + results.get(0).getMetadata());

        assertTrue(results.get(0).getText().contains("LDL cholesterol"));

    }
}
