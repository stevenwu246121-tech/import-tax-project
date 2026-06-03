package com.example.importtax.response;

import java.math.BigDecimal;

public class DashboardSummaryRes {

    private BigDecimal totalImportAmount;

    private BigDecimal totalDuty;

    private BigDecimal totalVat;

    private BigDecimal landedCostTotal;

    private Double averageTaxRate;

    public BigDecimal getTotalImportAmount() {
        return totalImportAmount;
    }

    public void setTotalImportAmount(BigDecimal totalImportAmount) {
        this.totalImportAmount = totalImportAmount;
    }

    public BigDecimal getTotalDuty() {
        return totalDuty;
    }

    public void setTotalDuty(BigDecimal totalDuty) {
        this.totalDuty = totalDuty;
    }

    public BigDecimal getTotalVat() {
        return totalVat;
    }

    public void setTotalVat(BigDecimal totalVat) {
        this.totalVat = totalVat;
    }

    public BigDecimal getLandedCostTotal() {
        return landedCostTotal;
    }

    public void setLandedCostTotal(BigDecimal landedCostTotal) {
        this.landedCostTotal = landedCostTotal;
    }

    public Double getAverageTaxRate() {
        return averageTaxRate;
    }

    public void setAverageTaxRate(Double averageTaxRate) {
        this.averageTaxRate = averageTaxRate;
    }
}