package com.campusreuse.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "trips")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tripId;

    @Column(nullable = false)
    private Long createdBy;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDate tripDate;

    @Column(nullable = false)
    private LocalTime departureTime;

    @Column(nullable = false)
    private String transportType; // Uber, Ola, Auto, Any

    @Column(nullable = false)
    private Integer maxMembers;

    @Column(nullable = false)
    private Integer currentMembers = 1;

    private BigDecimal estimatedFare;

    private String notes;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, FULL, CANCELLED, COMPLETED

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
