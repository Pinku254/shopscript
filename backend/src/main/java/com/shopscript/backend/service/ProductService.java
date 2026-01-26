package com.shopscript.backend.service;

import com.shopscript.backend.entity.Product;
import com.shopscript.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(p -> !p.isDeleted())
                .toList();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setImageUrl(productDetails.getImageUrl());
        product.setStock(productDetails.getStock());
        product.setCategory(productDetails.getCategory());
        product.setSubcategory(productDetails.getSubcategory());
        product.setDetails(productDetails.getDetails());
        product.setSizes(productDetails.getSizes());
        product.setSizePrices(productDetails.getSizePrices());
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setDeleted(true);
        productRepository.save(product);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query).stream()
                .filter(p -> !p.isDeleted())
                .toList();
    }
}
