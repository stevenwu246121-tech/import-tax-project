package com.example.importtax.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "import_tax_rule")
public class ImportTaxRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "import_country")
    private String importCountry;

    @Column(name = "origin_country")
    private String originCountry;

    @Column(name = "duty_rate")
    private BigDecimal dutyRate;

    @Column(name = "vat_rate")
    private BigDecimal vatRate;

    @ManyToOne
    @JoinColumn(name = "hs_code_id")
    private HsCode hsCode;

    // Getter Setter

    public Long getId() {
        return id;
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

    public BigDecimal getDutyRate() {
        return dutyRate;
    }

    public void setDutyRate(BigDecimal dutyRate) {
        this.dutyRate = dutyRate;
    }

    public BigDecimal getVatRate() {
        return vatRate;
    }

    public void setVatRate(BigDecimal vatRate) {
        this.vatRate = vatRate;
    }

    public HsCode getHsCode() {
        return hsCode;
    }

    public void setHsCode(HsCode hsCode) {
        this.hsCode = hsCode;
    }
}