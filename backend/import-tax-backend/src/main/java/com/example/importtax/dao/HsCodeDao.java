package com.example.importtax.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.importtax.entity.HsCode;

public interface HsCodeDao extends JpaRepository<HsCode, Long> {

	List<HsCode> findByCodeContainingOrNameContainingOrCategoryNameContaining(String code, String name,
			String categoryName);

	Optional<HsCode> findByCode(String code);
}