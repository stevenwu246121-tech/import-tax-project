package com.example.importtax.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.importtax.response.ExchangeRateRes;

@Service
public class ExchangeRateService {

	private final String API_URL = "https://open.er-api.com/v6/latest/TWD";

	public Double getJpyRate() {

		RestTemplate restTemplate = new RestTemplate();

		ExchangeRateRes response = restTemplate.getForObject(API_URL, ExchangeRateRes.class);

		if (response != null && response.getRates() != null) {
			Double rate = response.getRates().get("JPY");

			if (rate != null) {
				return rate;
			}
		}

		return 4.5;
	}
}