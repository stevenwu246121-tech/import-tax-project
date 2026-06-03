package com.example.importtax.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

import com.example.importtax.dao.PurchaseOrderDao;
import com.example.importtax.response.DashboardSummaryRes;

@Service
public class DashboardService {

	private final PurchaseOrderDao purchaseOrderDao;

	public DashboardService(PurchaseOrderDao purchaseOrderDao) {
		this.purchaseOrderDao = purchaseOrderDao;
	}

	public DashboardSummaryRes getSummary() {

		BigDecimal totalImport = purchaseOrderDao.getTotalImportAmount();

		BigDecimal totalDuty = purchaseOrderDao.getTotalDuty();

		BigDecimal totalVat = purchaseOrderDao.getTotalVat();

		DashboardSummaryRes response = new DashboardSummaryRes();

		response.setTotalImportAmount(totalImport);

		response.setTotalDuty(totalDuty);

		response.setTotalVat(totalVat);

		response.setLandedCostTotal(totalImport.add(totalDuty).add(totalVat));

		double avgTaxRate = totalImport.compareTo(BigDecimal.ZERO) == 0 ? 0
				: totalDuty.add(totalVat).divide(totalImport, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
						.doubleValue();

		response.setAverageTaxRate(avgTaxRate);

		return response;
	}
}