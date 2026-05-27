package com.example.importtax.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.importtax.entity.PurchaseOrderItem;

public interface PurchaseOrderItemDao extends JpaRepository<PurchaseOrderItem, Long> {
	
}