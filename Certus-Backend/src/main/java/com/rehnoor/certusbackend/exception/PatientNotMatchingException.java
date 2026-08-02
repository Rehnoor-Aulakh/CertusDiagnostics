package com.rehnoor.certusbackend.exception;

public class PatientNotMatchingException extends RuntimeException {
    public PatientNotMatchingException(String message) {
        super(message);
    }
}
