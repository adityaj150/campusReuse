package com.campusreuse.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class User implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String googleId;           // Google's unique subject ID

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String email;

    @Column
    private String profilePicture;     // URL from Google

    @Column
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String phoneNumber;        // Optional, for sharing with buyers
}
