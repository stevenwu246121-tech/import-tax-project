package com.example.importtax.request;

import java.math.BigDecimal;
import java.util.List;

public class CreateOrderReq {

	private List<OrderItemReq> items;

	private String importCountry;

	private String originCountry;

	private String currencyCode;

	private BigDecimal exchangeRate;

	public List<OrderItemReq> getItems() {
		return items;
	}

	public void setItems(List<OrderItemReq> items) {
		this.items = items;
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
}
