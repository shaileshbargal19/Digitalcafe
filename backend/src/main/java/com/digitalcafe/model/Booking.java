package com.digitalcafe.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long cafeId;

    private String cafeName;

    /** TABLE, BIRTHDAY, FUNCTION */
    @Column(nullable = false)
    private String bookingType;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private LocalTime bookingTime;

    private Integer guestCount;

    /** For birthday only */
    private String celebrantName;
    private String birthdayTheme;

    /** For function only */
    private String eventName;
    private String eventType;

    private String specialRequests;

    /** PENDING, CONFIRMED, CANCELLED */
    private String status = "PENDING";

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
