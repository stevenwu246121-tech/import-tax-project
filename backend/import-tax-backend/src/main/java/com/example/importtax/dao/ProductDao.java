package com.example.importtax.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.importtax.entity.Product;

public interface ProductDao extends JpaRepository<Product, Long> {
}