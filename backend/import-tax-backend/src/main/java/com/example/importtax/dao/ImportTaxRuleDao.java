package com.example.importtax.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.importtax.entity.HsCode;
import com.example.importtax.entity.ImportTaxRule;

public interface ImportTaxRuleDao
        extends JpaRepository<ImportTaxRule, Long> {

    Optional<ImportTaxRule> findByHsCode(HsCode hsCode);
}