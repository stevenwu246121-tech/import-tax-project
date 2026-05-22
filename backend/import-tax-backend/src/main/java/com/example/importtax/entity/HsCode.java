package com.example.importtax.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "hs_code")
public class HsCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private String name;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "duty_rate")
    private Double dutyRate;

    @Column(name = "vat_rate")
    private Double vatRate;

    private String description;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Double getDutyRate() { return dutyRate; }
    public void setDutyRate(Double dutyRate) { this.dutyRate = dutyRate; }

    public Double getVatRate() { return vatRate; }
    public void setVatRate(Double vatRate) { this.vatRate = vatRate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}