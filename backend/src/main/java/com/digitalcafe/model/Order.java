package com.digitalcafe.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private User customer;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items;

    private Double totalAmount;

    private String status; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

    private String serviceType; // DINE_IN, PICKUP

    private LocalDateTime createdAt;

    // Payment fields
    private String razorpayOrderId;   // Razorpay order_id from create-order
    private String paymentId;         // Razorpay payment_id after capture
    private String paymentStatus;     // UNPAID, PAID, FAILED

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (paymentStatus == null) paymentStatus = "UNPAID";
    }
}
