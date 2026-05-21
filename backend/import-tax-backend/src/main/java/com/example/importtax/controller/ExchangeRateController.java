package com.example.importtax.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.importtax.service.ExchangeRateService;

@RestController
public class ExchangeRateController {

    private final ExchangeRateService
        exchangeRateService;

    public ExchangeRateController(
        ExchangeRateService exchangeRateService
    ) {

        this.exchangeRateService =
            exchangeRateService;
    }

    @GetMapping("/api/exchange-rate/jpy")
    public Double getJpyRate() {

        return exchangeRateService
            .getJpyRate();
    }
}