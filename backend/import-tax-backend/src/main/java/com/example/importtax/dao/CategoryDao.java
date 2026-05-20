package com.example.importtax.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.importtax.entity.Category;

public interface CategoryDao extends JpaRepository<Category, Long> {

}