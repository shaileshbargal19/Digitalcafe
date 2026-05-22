package com.digitalcafe.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    // Common fields
    private String firstName;
    private String lastName;
    private String gender;
    private String dob;
    private String email;
    private String phone;
    private String password;
    private String role;
    private String address;
    private String city;
    private String pincode;
    private String state;
    private String country;

    // Role-specific / shared fields from form
    private String roleMetadata;      // Admin ID, Cafe Name, Food Preference, Staff specialty
    private String documentType;
    private String documentPath;
    private String education;
    private String gradeType;
    private String gradeValue;
    private Integer experienceYears;
}
