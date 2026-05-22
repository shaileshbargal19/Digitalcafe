package com.digitalcafe.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "vouchers")
@Data
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String title;
    private String description;
    private String discount;
    private String type; // Percent, Flat, Delivery, Loyalty
    private LocalDate expiryDate;
    private Integer daysLeft; // Optional: can be calculated
    private String status; // active, expired, used
    private String icon;
    private String color;

    private Long customerId;
}
