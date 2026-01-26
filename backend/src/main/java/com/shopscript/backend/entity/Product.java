package com.shopscript.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private String imageUrl;

    private Integer stock;

    private String category;

    private String subcategory;

    @Column(length = 2000)
    private String details;

    private String sizes; // Comma separated sizes e.g. "S,M,L,XL"

    @Column(length = 2000)
    private String sizePrices; // JSON string e.g. {"S": 100, "M": 120}

    private boolean deleted = false;
}
