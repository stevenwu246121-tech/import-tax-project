package com.example.importtax.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.importtax.entity.HsCode;

public interface HsCodeDao extends JpaRepository<HsCode, Long> {

	List<HsCode> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrKeywordsContainingIgnoreCase(
			String code,
			String name,
			String description,
			String keywords
	);

	Optional<HsCode> findByCode(String code);
}