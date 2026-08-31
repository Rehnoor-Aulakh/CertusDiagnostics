package com.rehnoor.certusbackend.service;

import com.rehnoor.certusbackend.service.rag.MedicalCorpusIngestionRunner;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class MedicalCorpusIngestionTest {

    @Autowired
    private MedicalCorpusIngestionRunner ingestionRunner;

    @Test
    void executeIngestion() {
        ingestionRunner.runIngestion();
    }
}
