package com.example.importtax.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.importtax.entity.HsCode;

public interface HsCodeDao extends JpaRepository<HsCode, Long> {
}