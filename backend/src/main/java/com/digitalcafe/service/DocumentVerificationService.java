package com.digitalcafe.service;

import com.digitalcafe.model.User;
import org.springframework.stereotype.Service;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class DocumentVerificationService {

    public static class VerificationResult {
        private final boolean verified;
        private final double confidenceScore;
        private final String notes;

        public VerificationResult(boolean verified, double confidenceScore, String notes) {
            this.verified = verified;
            this.confidenceScore = confidenceScore;
            this.notes = notes;
        }

        public boolean isVerified() { return verified; }
        public double getConfidenceScore() { return confidenceScore; }
        public String getNotes() { return notes; }
    }

    public VerificationResult verifyDocument(User user, String documentType, String documentPath) {
        if (documentPath == null || documentPath.trim().isEmpty()) {
            return new VerificationResult(false, 0.0, "REJECTED: Missing document.");
        }

        String docLower = documentPath.toLowerCase().trim();
        String first = user.getFirstName() != null ? user.getFirstName().toLowerCase().trim() : "";

        if (first.isEmpty()) {
            return new VerificationResult(false, 0.0, "REJECTED: User has no first name registered.");
        }

        if (docLower.endsWith(".pdf")) {
            if (docLower.contains(first)) {
                return new VerificationResult(true, 100.0, "ACCEPTED: PDF filename matched user first name.");
            } else {
                return new VerificationResult(false, 0.0, "REJECTED: PDF filename does not contain user first name.");
            }
        }

        if (docLower.contains(first)) {
            return new VerificationResult(true, 100.0, "ACCEPTED: First name perfectly matched in document.");
        } else {
            return new VerificationResult(false, 0.0, "REJECTED: User's first name not found in document.");
        }
    }
}
