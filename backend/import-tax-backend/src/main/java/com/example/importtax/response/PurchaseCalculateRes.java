package com.example.importtax.response;

import java.math.BigDecimal;
import java.util.List;

public class PurchaseCalculateRes {
	private List<PurchaseItemRes> items;

	private BigDecimal subtotal;

	private BigDecimal dutyTotal;

	private BigDecimal vatTotal;

	private BigDecimal landedCostTotal;

	public List<PurchaseItemRes> getItems() {
		return items;
	}

	public void setItems(List<PurchaseItemRes> items) {
		this.items = items;
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
}
