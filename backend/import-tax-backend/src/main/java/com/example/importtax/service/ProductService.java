package com.example.importtax.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.importtax.dao.ImportTaxRuleDao;
import com.example.importtax.dao.ProductDao;
import com.example.importtax.entity.ImportTaxRule;
import com.example.importtax.entity.Product;
import com.example.importtax.response.ProductRes;

@Service
public class ProductService {

    private final ProductDao productDao;

    private final ImportTaxRuleDao importTaxRuleDao;

    public ProductService(
            ProductDao productDao,
            ImportTaxRuleDao importTaxRuleDao) {

        this.productDao = productDao;
        this.importTaxRuleDao = importTaxRuleDao;
    }

    public List<ProductRes> getAll() {

        List<Product> products = productDao.findAll();

        List<ProductRes> responseList = new ArrayList<>();

        for (Product product : products) {

            ProductRes response = new ProductRes();

            response.setId(product.getId());

            response.setProductName(product.getName());

            response.setCategoryName(
                    product.getCategory().getName());

            response.setHsCode(
                    product.getHsCode().getCode());

            response.setUnitPrice(
                    product.getUnitPrice());

            ImportTaxRule taxRule =
                    importTaxRuleDao
                            .findByHsCode(product.getHsCode())
                            .orElse(null);

            if (taxRule != null) {

                response.setDutyRate(
                        taxRule.getDutyRate());

                response.setVatRate(
                        taxRule.getVatRate());
            }

            responseList.add(response);
        }

        return responseList;
    }
}