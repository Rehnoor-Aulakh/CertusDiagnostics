package com.rehnoor.certusbackend.service.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MedicalCorpusChunkerService {
    private static final Logger log = LoggerFactory.getLogger(MedicalCorpusChunkerService.class);

    private final TokenTextSplitter tokenSplitter = TokenTextSplitter.builder()
            .withChunkSize(500)
            .withMinChunkSizeChars(80)
            .withMinChunkLengthToEmbed(5)
            .withMaxNumChunks(10000)
            .withKeepSeparator(true)
            .build();

    public List<Document> chunkAndEnrich(List<Document> rawDocuments) {
        List<Document> allChunks = new ArrayList<>();
        for(Document document: rawDocuments) {
            Map<String, Object> metadata = document.getMetadata();
            String category = (String) metadata.getOrDefault("category", "General");
            String topic = (String) metadata.getOrDefault("topic", "General");
            String source_org_code = (String) metadata.getOrDefault("source_org_code", "General Medical Information");

            // Split the current raw document into token sized chunks
            List<Document> splits = tokenSplitter.split(List.of(document));

            // for every split, we need to append the metadata so that we dont lose the context
            for(int i=0; i<splits.size(); i++) {
                Document split = splits.get(i);
                String header = String.format("[Context: %s > %s | %s]\n", category, topic, source_org_code);
                String enrichedText = header + split.getText();

                // Clone Metadata and add chunk index
                Map<String, Object> chunkMeta = new HashMap<>(split.getMetadata());
                chunkMeta.put("chunk_index", i);
                chunkMeta.put("total_chunks", splits.size());

                allChunks.add(new Document(enrichedText, chunkMeta));
            }

        }
        log.info("Split {} source documents into {} enriched semantic chunks.", rawDocuments.size(), allChunks.size());
        return allChunks;
    }
}
