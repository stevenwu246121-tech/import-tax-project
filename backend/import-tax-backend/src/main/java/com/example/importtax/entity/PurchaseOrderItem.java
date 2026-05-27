package com.example.importtax.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_item")
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * 多個 item 對應一個 order
     */
    @ManyToOne
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    /*
     * 多個 item 對應一個 product
     */
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;

    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    private BigDecimal subtotal;

    @Column(name = "duty_rate")
    private BigDecimal dutyRate;

    @Column(name = "duty_amount")
    private BigDecimal dutyAmount;

    @Column(name = "vat_rate")
    private BigDecimal vatRate;

    @Column(name = "vat_amount")
    private BigDecimal vatAmount;

    @Column(name = "landed_cost")
    private BigDecimal landedCost;

    public PurchaseOrderItem() {
    }

    public Long getId() {
        return id;
    }

    public PurchaseOrder getPurchaseOrder() {
        return purchaseOrder;
    }

    public void setPurchaseOrder(PurchaseOrder purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDutyRate() {
        return dutyRate;
    }

    public void setDutyRate(BigDecimal dutyRate) {
        this.dutyRate = dutyRate;
    }

    public BigDecimal getDutyAmount() {
        return dutyAmount;
    }

    public void setDutyAmount(BigDecimal dutyAmount) {
        this.dutyAmount = dutyAmount;
    }

    public BigDecimal getVatRate() {
        return vatRate;
    }

    public void setVatRate(BigDecimal vatRate) {
        this.vatRate = vatRate;
    }

    public BigDecimal getVatAmount() {
        return vatAmount;
    }

    public void setVatAmount(BigDecimal vatAmount) {
        this.vatAmount = vatAmount;
    }

    public BigDecimal getLandedCost() {
        return landedCost;
    }

    public void setLandedCost(BigDecimal landedCost) {
        this.landedCost = landedCost;
    }
}