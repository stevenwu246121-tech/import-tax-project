package com.example.importtax.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "purchase_order")
public class PurchaseOrder {

	@JsonManagedReference
	@OneToMany(mappedBy = "purchaseOrder")
	private List<PurchaseOrderItem> items;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "order_no")
	private String orderNo;

	@Column(name = "supplier_name")
	private String supplierName;

	@Column(name = "import_country")
	private String importCountry;

	@Column(name = "origin_country")
	private String originCountry;

	@Column(name = "currency_code")
	private String currencyCode;

	@Column(name = "exchange_rate")
	private BigDecimal exchangeRate;

	private BigDecimal subtotal;

	@Column(name = "duty_total")
	private BigDecimal dutyTotal;

	@Column(name = "vat_total")
	private BigDecimal vatTotal;

	@Column(name = "landed_cost_total")
	private BigDecimal landedCostTotal;

	private String status;

	@Column(name = "created_at")
	private Timestamp createdAt;

	public PurchaseOrder() {
	}

	public Long getId() {
		return id;
	}

	public String getOrderNo() {
		return orderNo;
	}

	public void setOrderNo(String orderNo) {
		this.orderNo = orderNo;
	}

	public String getSupplierName() {
		return supplierName;
	}

	public void setSupplierName(String supplierName) {
		this.supplierName = supplierName;
	}

	public String getImportCountry() {
		return importCountry;
	}

	public void setImportCountry(String importCountry) {
		this.importCountry = importCountry;
	}

	public String getOriginCountry() {
		return originCountry;
	}

	public void setOriginCountry(String originCountry) {
		this.originCountry = originCountry;
	}

	public String getCurrencyCode() {
		return currencyCode;
	}

	public void setCurrencyCode(String currencyCode) {
		this.currencyCode = currencyCode;
	}

	public BigDecimal getExchangeRate() {
		return exchangeRate;
	}

	public void setExchangeRate(BigDecimal exchangeRate) {
		this.exchangeRate = exchangeRate;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(BigDecimal subtotal) {
		this.subtotal = subtotal;
	}

	public BigDecimal getDutyTotal() {
		return dutyTotal;
	}

	public void setDutyTotal(BigDecimal dutyTotal) {
		this.dutyTotal = dutyTotal;
	}

	public BigDecimal getVatTotal() {
		return vatTotal;
	}

	public void setVatTotal(BigDecimal vatTotal) {
		this.vatTotal = vatTotal;
	}

	public BigDecimal getLandedCostTotal() {
		return landedCostTotal;
	}

	public void setLandedCostTotal(BigDecimal landedCostTotal) {
		this.landedCostTotal = landedCostTotal;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Timestamp getCreatedAt() {
	    return createdAt;
	}

	public void setCreatedAt(Timestamp createdAt) {
	    this.createdAt = createdAt;
	}
}