package com.example.importtax.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.importtax.entity.PurchaseOrderItem;

public interface PurchaseOrderItemDao
        extends JpaRepository<PurchaseOrderItem, Long> {

    List<PurchaseOrderItem> findByPurchaseOrder_Id(Long purchaseOrderId);
}