package com.rehnoor.certusbackend.config;

import com.rehnoor.certusbackend.service.ReportIngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Arrays;

@Component
public class DatabaseSeederRunner implements CommandLineRunner {
    @Autowired
    ReportIngestionService ingestionService;

    @Value("${app.seeder.enabled:false}")
    private boolean seederEnabled;

    @Override
    public void run(String... args) throws Exception {
        if (!seederEnabled) {
            System.out.println("⚠️ Database Seeder is disabled via application properties. Skipping.");
            return;
        }

        System.out.println("🔍 Scanning target system resources directory for diagnostic reports...");

        // Path resolver handles finding files reliably across absolute and embedded resource trees
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        try{
            Resource[] resources = resolver.getResources("classpath:reports/*.pdf");
            if(resources.length == 0){
                System.out.println("⚠️ System Maintenance: No PDF seed files found inside 'src/main/resources/reports/' directory.");
                return;
            }
            // Convert resources to files to sort them alphabetically
            File[] pdfFiles = new File[resources.length];
            for (int i = 0; i < resources.length; i++) {
                pdfFiles[i] = resources[i].getFile();
            }
            // Force precise alphabetical sorting based on file names
            Arrays.sort(pdfFiles, (f1, f2) -> f1.getName().compareToIgnoreCase(f2.getName()));
            System.out.println("🚀 Starting pipeline ingestion loop for " + pdfFiles.length + " historical records in alphabetical order...");

            int successCount = 0;
            for(File file: pdfFiles){
                try{
                    ingestionService.processDiagnosticPDFWithRealData(file);
                    successCount++;
                } catch (Exception e) {
                    System.err.println("❌ Critical failure parsing file block: " + file.getName() + " -> " + e.getMessage());
                }
                System.out.println("=================================================================");
                System.out.println("✅ ETL Batch pipeline process completely finalized.");
                System.out.println("Successfully processed and anonymized: " + successCount + "/" + pdfFiles.length + " files.");
                System.out.println("=================================================================");
            }
        } catch (Exception e) {
            System.err.println("❌ Configuration failure during batch directory streaming initialization: " + e.getMessage());
        }

    }
}
