package com.shopscript.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admins")
@Data
@NoArgsConstructor
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    // Admin table implicitly implies ADMIN role, but helpful for consistency
    @Transient // Not saved in DB, just for logic if needed, or we can just hardcode role in
               // UserDetails
    private String role = "ADMIN";
}
