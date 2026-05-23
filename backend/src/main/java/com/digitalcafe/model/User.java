package com.digitalcafe.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq_gen")
    @SequenceGenerator(name = "user_seq_gen", sequenceName = "user_seq", allocationSize = 1)
    private Long id;

    // Common Information
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;

    private String gender;
    private String dob;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    private String password;

    private String address;
    private String city;
    private String pincode;
    private String state;
    private String country;
    
    private String role; 

    @Column(nullable = false)
    private String status = "PENDING"; 
    
    private Long approvedBy; 
    private Double verificationScore;
    private String verificationNotes;
    private String otp; 
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
