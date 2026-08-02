package com.rehnoor.certusbackend.exception;

import java.util.List;
import java.util.Map;

public class PatientNotMatchingException extends RuntimeException {
    private final List<Map<String, Object>> suggestedPatients;
    private final boolean isNewPatient;

    public PatientNotMatchingException(String message) {
        super(message);
        this.suggestedPatients = null;
        this.isNewPatient = false;
    }

    public PatientNotMatchingException(String message, List<Map<String, Object>> suggestedPatients, boolean isNewPatient) {
        super(message);
        this.suggestedPatients = suggestedPatients;
        this.isNewPatient = isNewPatient;
    }

    public List<Map<String, Object>> getSuggestedPatients() {
        return suggestedPatients;
    }

    public boolean isNewPatient() {
        return isNewPatient;
    }
}
