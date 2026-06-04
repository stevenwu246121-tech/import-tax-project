package com.example.importtax.response;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public class PurchaseOrderDetailRes {

	private Long id;

	private String orderNo;

	private String supplierName;

	private String importCountry;

	private String originCountry;

	private String currencyCode;

	private BigDecimal exchangeRate;

	private BigDecimal subtotal;

	private BigDecimal dutyTotal;

	private BigDecimal vatTotal;

	private BigDecimal landedCostTotal;

	private String status;

	private Timestamp createdAt;

	private List<PurchaseOrderItemRes> items;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public List<PurchaseOrderItemRes> getItems() {
		return items;
	}

	public void setItems(List<PurchaseOrderItemRes> items) {
		this.items = items;
	}
}