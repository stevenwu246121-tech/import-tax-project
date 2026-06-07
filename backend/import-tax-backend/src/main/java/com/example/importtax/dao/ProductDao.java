package com.example.importtax.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.importtax.entity.Product;

public interface ProductDao extends JpaRepository<Product, Long> {
	
	List<Product> findByStockQtyLessThanEqual(Integer stockQty);
}