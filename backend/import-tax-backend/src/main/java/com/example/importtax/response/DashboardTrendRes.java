package com.example.importtax.response;

import java.math.BigDecimal;

public class DashboardTrendRes {

    private String date;

    private BigDecimal amount;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}