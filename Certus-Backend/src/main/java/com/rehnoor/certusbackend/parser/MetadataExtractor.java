package com.rehnoor.certusbackend.parser;

import com.rehnoor.certusbackend.parser.model.DiagnosticMetadata;
import com.rehnoor.certusbackend.parser.model.Gender;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// TODO: Sample Collected On, Sample Received On, Report Released on are available in PDF Page 4

public class MetadataExtractor {
    public DiagnosticMetadata extract(PDDocument document) throws IOException {
        DiagnosticMetadata metadata = new DiagnosticMetadata();

        String firstPage = getPageText(document, 1);

        String secondLastPage = getPageText(document, Math.max(1, document.getNumberOfPages()-1));
        
        String datePage = getPageText(document, Math.min(4, document.getNumberOfPages()));

        parsePatientInformation(metadata, firstPage);
        parseReportInformation(metadata, firstPage);
        parseAmountCollected(metadata, secondLastPage);
        parseSampleDates(metadata, datePage);

        return metadata;

    }

    private void parsePatientInformation(DiagnosticMetadata metadata, String pageText){
        String rawName = extractValue(pageText, "Name\\s*:\\s*(.+)");
        // This returns
        // Rehnoor Aulakh(21Y/M)
        if(rawName==null) return;
        // Now split it
        String patientName = rawName.split("\\(")[0].trim();
        metadata.setPatientName(patientName);
        // Age + Gender Extraction
        Matcher matcher = Pattern.compile("\\((\\d+)Y/([MF])\\)" ).matcher(rawName);

        if(matcher.find()){
            metadata.setAge(Integer.parseInt(matcher.group(1)));

            String gender = matcher.group(2);

            switch (gender) {
                case "M" -> metadata.setGender(Gender.MALE);
                case "F" -> metadata.setGender(Gender.FEMALE);
                default -> metadata.setGender(Gender.OTHER);
            }
        }
    }

    private void parseReportInformation(DiagnosticMetadata metadata, String pageText){
        String date = extractValue(pageText, "Date.*?\\s*:\\s*(.+)");
        
        String pkgName = extractValue(pageText, "Test Asked.*?\\s*:\\s*(.+)");
        if (pkgName == null || pkgName.isBlank()) {
            pkgName = extractValue(pageText, "Tests Done.*?\\s*:\\s*(.+)");
        }
        metadata.setPackageName(pkgName);

        metadata.setReportStatus(extractValue(pageText, "Report Status\\s*:\\s*(.+)"));


        if(date!=null) {
            try{
                LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("d MMM, yyyy", Locale.ENGLISH));

                metadata.setReportDate(localDate.atStartOfDay(ZoneId.systemDefault()).toLocalDateTime());
            } catch (DateTimeParseException e) {

                System.out.println("Couldn't parse date: " + date);

            }
        }
    }

    private void parseAmountCollected(DiagnosticMetadata metadata, String pageText){

        String amount = extractValue(pageText, "Amount Collected\\s*:\\s*(.+)");

        if(amount==null || amount.equals("-")){
            metadata.setAmountCollected(BigDecimal.ZERO);
            return;
        }
        Matcher matcher = Pattern.compile("(\\d[\\d,]*)").matcher(amount);

        if (matcher.find()) {
            String numericAmount = matcher.group(1).replace(",", "");
            metadata.setAmountCollected(new BigDecimal(numericAmount));

        } else {
            metadata.setAmountCollected(BigDecimal.ZERO);
        }
    }

    private void parseSampleDates(DiagnosticMetadata metadata, String pageText) {
        String sco = extractValue(pageText, "Sample Collected.*?\\s*:\\s*(.+)");
        String sro = extractValue(pageText, "Sample Received.*?\\s*:\\s*(.+)");
        String rro = extractValue(pageText, "Report Released.*?\\s*:\\s*(.+)");

        metadata.setSampleCollectedOn(parseDateTime(sco));
        metadata.setSampleReceivedOn(parseDateTime(sro));
        metadata.setReportReleasedOn(parseDateTime(rro));
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isBlank()) return null;
        String normalized = dateTimeStr.trim().replaceAll("\\s+", " ");
        DateTimeFormatter[] formatters = {
                DateTimeFormatter.ofPattern("d MMM, yyyy hh:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("d MMM, yyyy HH:mm", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("d MMM yyyy HH:mm", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("d MMM yyyy hh:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm:ss a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("d MMM, yyyy", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH)
        };
        for (DateTimeFormatter formatter : formatters) {
            try {
                if (formatter.toString().contains("HH") || formatter.toString().contains("hh")) {
                    return LocalDateTime.parse(normalized, formatter);
                } else {
                    return LocalDate.parse(normalized, formatter).atStartOfDay();
                }
            } catch (DateTimeParseException ignored) {
            }
        }
        System.out.println("Couldn't parse date time: " + dateTimeStr);
        return null;
    }

    private String getPageText(PDDocument document, int page) throws  IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setSortByPosition(true);
        stripper.setStartPage(page);
        stripper.setEndPage(page);
        return stripper.getText(document);
    }

    private String extractValue(String text, String regex) {

        Matcher matcher = Pattern.compile(
                regex,
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        ).matcher(text);

        if (matcher.find()) {
            String value = matcher.group(1);

            value = value.split("\\r?\\n")[0];
            
            // Clean up trailing text from side-by-side elements on the same row line
            value = value.split("(?i)Test Asked|Date|Report Status|Tests Done|Address|Referred By|Sample Collected|Sample Received|Report Released")[0];

            return value.trim();
        }

        return null;
    }
}

