package com.example.importtax.response;

import java.util.Map;

public class ExchangeRateRes {

	private String result;

	private String base_code;

	private Map<String, Double> rates;

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public String getBase_code() {
		return base_code;
	}

	public void setBase_code(String base_code) {
		this.base_code = base_code;
	}

	public Map<String, Double> getRates() {
		return rates;
	}

	public void setRates(Map<String, Double> rates) {
		this.rates = rates;
	}
}