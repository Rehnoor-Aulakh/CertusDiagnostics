package com.rehnoor.certusbackend.controller;

import com.rehnoor.certusbackend.exception.DuplicateReportException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(DuplicateReportException.class)
    public ResponseEntity<?> handleDuplicate(DuplicateReportException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("success", false, "message", ex.getMessage()));
    }

    @ExceptionHandler(com.rehnoor.certusbackend.exception.PatientNotMatchingException.class)
    public ResponseEntity<?> handlePatientNotMatching(com.rehnoor.certusbackend.exception.PatientNotMatchingException ex){
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        body.put("isNewPatient", ex.isNewPatient());
        if (ex.getSuggestedPatients() != null && !ex.getSuggestedPatients().isEmpty()) {
            body.put("suggestedPatients", ex.getSuggestedPatients());
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", ex.getMessage()));
    }
}
