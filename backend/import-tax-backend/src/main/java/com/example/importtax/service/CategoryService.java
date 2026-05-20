package com.example.importtax.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.importtax.dao.CategoryDao;
import com.example.importtax.entity.Category;

@Service
public class CategoryService {

    private final CategoryDao categoryDao;

    // 手動建構子注入
    public CategoryService(CategoryDao categoryDao) {
        this.categoryDao = categoryDao;
    }

    public List<Category> getAll() {
        return categoryDao.findAll();
    }
}