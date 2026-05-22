package com.digitalcafe.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String category;

    @Column(nullable = false)
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private Boolean available = true;

    private Boolean isFeatured = false;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
}
