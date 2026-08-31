package com.rehnoor.certusbackend.service.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class MedicalCorpusIngestionRunner {

    private static final Logger log = LoggerFactory.getLogger(MedicalCorpusIngestionRunner.class);

    private final KnowledgeBaseReaderService readerService;
    private final MedicalCorpusChunkerService chunkerService;
    private final VectorStore vectorStore;

    public MedicalCorpusIngestionRunner(
            KnowledgeBaseReaderService readerService,
            MedicalCorpusChunkerService chunkerService,
            VectorStore vectorStore
    ) {
        this.readerService = readerService;
        this.chunkerService = chunkerService;
        this.vectorStore=vectorStore;
    }

    public void runIngestion() {
        log.info("Starting knowledge base parsing and chunking");
        List<Document> rawDocs = readerService.loadCleanDocuments();
        List<Document> chunks = chunkerService.chunkAndEnrich(rawDocs);

        int batchSize = 25;     // 25 chunks per API call
        int totalBatches = (int) Math.ceil((double) chunks.size() / batchSize);
        log.info("Beginning throttled embedding ingestion: {} chunks across {} batches.", chunks.size(), totalBatches);

        for(int i=0; i<chunks.size(); i+=batchSize) {
            int batchNum = (i/batchSize) + 1;
            List<Document> batch = chunks.subList(i, Math.min(i+batchSize, chunks.size()));

            boolean success = false;
            int retries = 0;
            long backoffMs = 15000;     // 15 second initial backoff on failure

            while(!success && retries<4) {
                try{
                    log.info("Embedding and storing Batch {} / {} ({} chunks)", batchNum, totalBatches, batch.size());
                    // spring ai, behind the scenes calls our embedding model, and stores it in the vector store defined in config
                    vectorStore.add(batch);
                    success = true;

                    // Safe rate-limiting delay to stay under ~5 RPM free tier calling
                    if(i + batchSize < chunks.size()) {
                        TimeUnit.SECONDS.sleep(12);
                    }
                } catch(Exception e) {
                    retries++;
                    log.warn("Batch {} failed on attempt {} due to rate limit/error. Retrying in {} ms...", batchNum, retries, backoffMs);

                    try{
                        Thread.sleep(backoffMs);
                    } catch(InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                    backoffMs *=2; // exponential backoff
                }
            }
            if(!success) {
                log.error("Fatal: Batch {} failed permanently after retries. Aborting ingestion.", batchNum);
                break;
            }
        }
        log.info("Medical knowledge corpus successfully embedded and indexed into PGvector!");
    }
}
