package com.example.importtax.request;

import java.math.BigDecimal;

public class ProductReq {

	private String name;
	private Long categoryId;
	private Long hsCodeId;
	private String originCountry;
	private String unit;
	private BigDecimal unitPrice;
	private Integer stockQty;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
	}

	public Long getHsCodeId() {
		return hsCodeId;
	}

	public void setHsCodeId(Long hsCodeId) {
		this.hsCodeId = hsCodeId;
	}

	public String getOriginCountry() {
		return originCountry;
	}

	public void setOriginCountry(String originCountry) {
		this.originCountry = originCountry;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public BigDecimal getUnitPrice() {
		return unitPrice;
	}

	public void setUnitPrice(BigDecimal unitPrice) {
		this.unitPrice = unitPrice;
	}

	public Integer getStockQty() {
		return stockQty;
	}

	public void setStockQty(Integer stockQty) {
		this.stockQty = stockQty;
	}
}