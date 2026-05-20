package com.example.importtax.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.importtax.dao.ImportTaxRuleDao;
import com.example.importtax.dao.ProductDao;

import com.example.importtax.entity.ImportTaxRule;
import com.example.importtax.entity.Product;
import com.example.importtax.request.PurchaseCalculateReq;
import com.example.importtax.request.PurchaseItemReq;
import com.example.importtax.response.PurchaseCalculateRes;
import com.example.importtax.response.PurchaseItemRes;

@Service
public class PurchaseService {

	private final ProductDao productDao;

	private final ImportTaxRuleDao importTaxRuleDao;

	public PurchaseService(ProductDao productDao, ImportTaxRuleDao importTaxRuleDao) {

		this.productDao = productDao;
		this.importTaxRuleDao = importTaxRuleDao;
	}

	public PurchaseCalculateRes calculate(PurchaseCalculateReq request) {

		BigDecimal subtotal = BigDecimal.ZERO;

		BigDecimal dutyTotal = BigDecimal.ZERO;

		BigDecimal vatTotal = BigDecimal.ZERO;

		List<PurchaseItemRes> itemResponses = new ArrayList<>();

		for (PurchaseItemReq item : request.getItems()) {

			Optional<Product> optionalProduct = productDao.findById(item.getProductId());

			if (optionalProduct.isEmpty()) {
				continue;
			}

			Product product = optionalProduct.get();

			BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());

			BigDecimal itemSubtotal = product.getUnitPrice().multiply(quantity);

			subtotal = subtotal.add(itemSubtotal);

			ImportTaxRule taxRule = importTaxRuleDao.findByHsCode(product.getHsCode()).orElse(null);

			if (taxRule != null) {

				BigDecimal dutyAmount = itemSubtotal.multiply(taxRule.getDutyRate()).divide(BigDecimal.valueOf(100));

				dutyTotal = dutyTotal.add(dutyAmount);

				BigDecimal vatBase = itemSubtotal.add(dutyAmount);

				BigDecimal vatAmount = vatBase.multiply(taxRule.getVatRate()).divide(BigDecimal.valueOf(100));

				vatTotal = vatTotal.add(vatAmount);

				PurchaseItemRes itemResponse = new PurchaseItemRes();

				itemResponse.setProductName(product.getName());

				itemResponse.setQuantity(item.getQuantity());

				itemResponse.setUnitPrice(product.getUnitPrice());

				itemResponse.setSubtotal(itemSubtotal);

				itemResponse.setDutyRate(taxRule.getDutyRate());

				itemResponse.setDutyAmount(dutyAmount);

				itemResponse.setVatRate(taxRule.getVatRate());

				itemResponse.setVatAmount(vatAmount);

				itemResponse.setLandedCost(itemSubtotal.add(dutyAmount).add(vatAmount));

				itemResponses.add(itemResponse);
			}
		}

		PurchaseCalculateRes response = new PurchaseCalculateRes();

		response.setItems(itemResponses);

		response.setSubtotal(subtotal);

		response.setDutyTotal(dutyTotal);

		response.setVatTotal(vatTotal);

		response.setLandedCostTotal(subtotal.add(dutyTotal).add(vatTotal));

		return response;
	}
}