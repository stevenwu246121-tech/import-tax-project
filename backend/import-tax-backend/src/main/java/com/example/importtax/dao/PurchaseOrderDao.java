package com.example.importtax.dao;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.importtax.entity.PurchaseOrder;

public interface PurchaseOrderDao extends JpaRepository<PurchaseOrder, Long> {

	List<PurchaseOrder> findAllByOrderByCreatedAtDesc();

	@Query("""
			SELECT COALESCE(SUM(p.subtotal),0)
			FROM PurchaseOrder p
			""")
	BigDecimal getTotalImportAmount();

	@Query("""
			SELECT COALESCE(SUM(p.dutyTotal),0)
			FROM PurchaseOrder p
			""")
	BigDecimal getTotalDuty();

	@Query("""
			SELECT COALESCE(SUM(p.vatTotal),0)
			FROM PurchaseOrder p
			""")
	BigDecimal getTotalVat();
}
