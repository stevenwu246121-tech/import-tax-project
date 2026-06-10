package com.example.importtax.dao;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.importtax.entity.PurchaseOrder;

public interface PurchaseOrderDao extends JpaRepository<PurchaseOrder, Long> {

	List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
	
	long countByOrderNoStartingWith(String prefix);

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

	@Query(value = """
			SELECT
			    DATE(created_at) AS orderDate,
			    SUM(subtotal) AS totalAmount
			FROM purchase_order
			WHERE created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)
			GROUP BY DATE(created_at)
			ORDER BY DATE(created_at)
			""", nativeQuery = true)
	List<Object[]> getTrendData(@Param("days") int days);
}