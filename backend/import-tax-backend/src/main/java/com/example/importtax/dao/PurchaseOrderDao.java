package com.example.importtax.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.importtax.entity.PurchaseOrder;

public interface PurchaseOrderDao extends JpaRepository<PurchaseOrder, Long> {
	
}
