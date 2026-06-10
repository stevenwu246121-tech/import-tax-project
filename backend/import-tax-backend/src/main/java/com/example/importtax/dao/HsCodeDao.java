package com.example.importtax.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.importtax.entity.HsCode;

@Repository
public interface HsCodeDao extends JpaRepository<HsCode, Long> {

    List<HsCode> findByCodeContainingOrNameContainingOrCategoryNameContaining(
            String code,
            String name,
            String categoryName
    );

    List<HsCode> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrKeywordsContainingIgnoreCase(
            String code,
            String name,
            String description,
            String keywords
    );
}