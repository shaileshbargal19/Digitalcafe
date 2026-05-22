package com.digitalcafe.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "admins")
@Data
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {
    private String documentType;
    private String documentPath;
    private String education;
    private String gradeType;
    private Double gradeValue;
    private Integer experienceYears;
}
