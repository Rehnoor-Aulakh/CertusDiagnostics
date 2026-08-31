package com.rehnoor.certusbackend.service.rag;

import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.slf4j.Logger;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class KnowledgeBaseReaderService {
    private static final Logger log = LoggerFactory.getLogger(KnowledgeBaseReaderService.class);
    // Pattern to capture YAML frontmatter delimited by ---
    private static final Pattern FRONTMATTER_PATTERN =
            Pattern.compile("^---\\s*\\r?\\n([\\s\\S]*?)\\r?\\n---\\s*\\r?\\n([\\s\\S]*)");

    public List<Document> loadCleanDocuments(){
        List<Document> documents = new ArrayList<>();
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        try {
            Resource[] resources = resolver.getResources("classpath:knowledge_base/**/clean/**/*.md");
            log.info("Found {} clean markdown files in classpath", resources.length);

            for(Resource resource: resources) {
                Document document = parseResource(resource);
                if(document != null) {
                    documents.add(document);
                }
            }
        } catch(Exception e) {
            log.error("Error reading knowledge base resources", e);
        }
        return documents;

    }

    private Document parseResource(Resource resource) {
        try {
            String content;
            try(BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)
            )) {
                content = reader.lines().collect(Collectors.joining("\n"));

            }
            Map<String, Object> metadata = new HashMap<>();
            String body = content;

            //1. Parse YAML Frontmatter
            Matcher matcher = FRONTMATTER_PATTERN.matcher(content);
            if(matcher.find()) {
                String frontmatter = matcher.group(1);
                body = matcher.group(2).trim();

                for(String line: frontmatter.split("\n")) {
                    int colonIndex = line.indexOf(":");
                    if(colonIndex>0) {
                        String key = line.substring(0, colonIndex).trim();
                        String val = line.substring(colonIndex+1).trim();
                        metadata.put(key, val);
                    }
                }
            }
            // 2. Extract Category, Topic and Source from URI Path:
            // Format Expected: .../knowledge_base/{category}/{topic}/clean/{source}/v1.md
            String uriPath = resource.getURI().toString().replace("\\", "/");
            int kbIndex = uriPath.indexOf("knowledge_base/");
            if(kbIndex!=-1 ) {
                String relativePath = uriPath.substring(kbIndex+"knowledge_base/".length());
                relativePath = relativePath.replaceAll("^/+", ""); // remove leading slashes

                String[] parts = relativePath.split("/");
                if(parts.length >=4 ){
                    metadata.put("category", parts[0]);
                    metadata.put("topic", parts[1]);
                    metadata.put("source_org_code", parts[3]);
                }
                metadata.put("file_path", relativePath);
            }
            return new Document(body, metadata);

        } catch(Exception e) {
            log.error("Failed to parse resource: {}", resource.getFilename(), e);
            return null;
        }
    }

}

