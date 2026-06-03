package com.example.importtax.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import com.example.importtax.dao.CategoryDao;
import com.example.importtax.entity.Category;
import com.example.importtax.dao.HsCodeDao;
import com.example.importtax.entity.HsCode;
import com.example.importtax.request.HsCodeReq;

@Service
public class HsCodeService {

	private final HsCodeDao hsCodeDao;

	private final CategoryDao categoryDao;

	public HsCodeService(
	        HsCodeDao hsCodeDao,
	        CategoryDao categoryDao
	) {
	    this.hsCodeDao = hsCodeDao;
	    this.categoryDao = categoryDao;
	}

    public List<HsCode> getAll() {
        return hsCodeDao.findAll();
    }

    public void create(HsCodeReq req) {
    	
    	if (req.getDutyRate() == null || req.getDutyRate().compareTo(BigDecimal.ZERO) < 0) {
    	    throw new RuntimeException("Duty rate cannot be negative");
    	}

    	if (req.getVatRate() == null || req.getVatRate().compareTo(BigDecimal.ZERO) < 0) {
    	    throw new RuntimeException("VAT rate cannot be negative");
    	}

        Category category = categoryDao.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        HsCode hsCode = new HsCode();

        hsCode.setCode(req.getCode());

        hsCode.setName(req.getName());

        hsCode.setCategoryName(category.getName());

        hsCode.setDutyRate(req.getDutyRate());

        hsCode.setVatRate(req.getVatRate());

        hsCode.setDescription(req.getDescription());

        hsCodeDao.save(hsCode);
    }

    public void update(Long id, HsCodeReq req) {
    	
    	if (req.getDutyRate() == null || req.getDutyRate().compareTo(BigDecimal.ZERO) < 0) {
    	    throw new RuntimeException("Duty rate cannot be negative");
    	}

    	if (req.getVatRate() == null || req.getVatRate().compareTo(BigDecimal.ZERO) < 0) {
    	    throw new RuntimeException("VAT rate cannot be negative");
    	}

        HsCode hsCode = hsCodeDao.findById(id)
                .orElseThrow(() -> new RuntimeException("HsCode not found"));

        Category category = categoryDao.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        hsCode.setCode(req.getCode());
        hsCode.setName(req.getName());
        hsCode.setCategoryName(category.getName());
        hsCode.setDutyRate(req.getDutyRate());
        hsCode.setVatRate(req.getVatRate());
        hsCode.setDescription(req.getDescription());

        hsCodeDao.save(hsCode);
    }

    public void delete(Long id) {
        hsCodeDao.deleteById(id);
    }
    
    
}