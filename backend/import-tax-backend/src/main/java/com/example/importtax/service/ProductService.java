package com.example.importtax.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.importtax.dao.CategoryDao;
import com.example.importtax.dao.HsCodeDao;
import com.example.importtax.dao.ImportTaxRuleDao;
import com.example.importtax.dao.ProductDao;
import com.example.importtax.entity.Category;
import com.example.importtax.entity.HsCode;
import com.example.importtax.entity.ImportTaxRule;
import com.example.importtax.entity.Product;
import com.example.importtax.request.ProductReq;
import com.example.importtax.response.ProductRes;

@Service
public class ProductService {

	private final ProductDao productDao;

	private final ImportTaxRuleDao importTaxRuleDao;

	private final CategoryDao categoryDao;

	private final HsCodeDao hsCodeDao;

	public ProductService(ProductDao productDao, ImportTaxRuleDao importTaxRuleDao, CategoryDao categoryDao,
			HsCodeDao hsCodeDao) {

		this.productDao = productDao;
		this.importTaxRuleDao = importTaxRuleDao;
		this.categoryDao = categoryDao;
		this.hsCodeDao = hsCodeDao;
	}

	public List<ProductRes> getAll() {

		List<Product> products = productDao.findAll();

		List<ProductRes> responseList = new ArrayList<>();

		for (Product product : products) {

			ProductRes res = new ProductRes();

			res.setId(product.getId());

			res.setProductName(product.getName());

			res.setCategoryName(product.getCategory().getName());

			res.setHsCode(product.getHsCode().getCode());

			res.setUnitPrice(product.getUnitPrice());

			res.setStockQty(product.getStockQty());

			ImportTaxRule taxRule = importTaxRuleDao.findByHsCode(product.getHsCode()).orElse(null);

			if (taxRule != null) {

				res.setDutyRate(taxRule.getDutyRate());

				res.setVatRate(taxRule.getVatRate());
			}

			responseList.add(res);
		}

		return responseList;
	}

	public void create(ProductReq req) {

		Category category = categoryDao.findById(req.getCategoryId())
				.orElseThrow(() -> new RuntimeException("Category not found"));

		HsCode hsCode = hsCodeDao.findById(req.getHsCodeId())
				.orElseThrow(() -> new RuntimeException("HS Code not found"));

		Product product = new Product();

		product.setName(req.getName());

		product.setCategory(category);

		product.setHsCode(hsCode);

		product.setOriginCountry(req.getOriginCountry());

		product.setUnit(req.getUnit());

		product.setUnitPrice(req.getUnitPrice());

		product.setStockQty(req.getStockQty() == null ? 0 : req.getStockQty());

		product.setEnabled(true);

		productDao.save(product);
	}

	public void delete(Long productId) {

		productDao.deleteById(productId);
	}

	public void update(Long productId, ProductReq req) {

		Product product = productDao.findById(productId).orElseThrow();

		Category category = categoryDao.findById(req.getCategoryId()).orElseThrow();

		HsCode hsCode = hsCodeDao.findById(req.getHsCodeId()).orElseThrow();

		product.setName(req.getName());

		product.setCategory(category);

		product.setHsCode(hsCode);

		product.setOriginCountry(req.getOriginCountry());

		product.setUnit(req.getUnit());

		product.setUnitPrice(req.getUnitPrice());

		product.setStockQty(req.getStockQty() == null ? 0 : req.getStockQty());

		productDao.save(product);
	}
}