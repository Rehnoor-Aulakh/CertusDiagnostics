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

}
