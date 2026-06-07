package com.example.importtax.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.importtax.dao.ProductDao;
import com.example.importtax.dao.PurchaseOrderDao;
import com.example.importtax.entity.Product;
import com.example.importtax.response.DashboardSummaryRes;
import com.example.importtax.response.DashboardTrendRes;
import com.example.importtax.response.LowStockRes;

@Service
public class DashboardService {

    private final PurchaseOrderDao purchaseOrderDao;

    private final ProductDao productDao;

    public DashboardService(
            PurchaseOrderDao purchaseOrderDao,
            ProductDao productDao
    ) {
        this.purchaseOrderDao = purchaseOrderDao;
        this.productDao = productDao;
    }

    public DashboardSummaryRes getSummary() {

        BigDecimal totalImport =
                purchaseOrderDao.getTotalImportAmount();

        BigDecimal totalDuty =
                purchaseOrderDao.getTotalDuty();

        BigDecimal totalVat =
                purchaseOrderDao.getTotalVat();

        DashboardSummaryRes response =
                new DashboardSummaryRes();

        response.setTotalImportAmount(totalImport);

        response.setTotalDuty(totalDuty);

        response.setTotalVat(totalVat);

        response.setLandedCostTotal(
                totalImport
                        .add(totalDuty)
                        .add(totalVat)
        );

        double avgTaxRate =
                totalImport.compareTo(BigDecimal.ZERO) == 0
                        ? 0
                        : totalDuty
                                .add(totalVat)
                                .divide(
                                        totalImport,
                                        4,
                                        RoundingMode.HALF_UP
                                )
                                .multiply(
                                        BigDecimal.valueOf(100)
                                )
                                .doubleValue();

        response.setAverageTaxRate(avgTaxRate);

        return response;
    }

    public List<DashboardTrendRes> getTrend(int days) {

        List<Object[]> results =
                purchaseOrderDao.getTrendData(days);

        return results.stream()
                .map(row -> {
                    DashboardTrendRes res =
                            new DashboardTrendRes();

                    res.setDate(row[0].toString());

                    res.setAmount((BigDecimal) row[1]);

                    return res;
                })
                .toList();
    }

    public List<LowStockRes> getLowStockProducts() {

        List<Product> products =
                productDao.findByStockQtyLessThanEqual(10);

        return products.stream()
                .map(product -> {
                    LowStockRes res =
                            new LowStockRes();

                    res.setProductId(product.getId());

                    res.setProductName(product.getName());

                    res.setStockQty(
                            product.getStockQty() == null
                                    ? 0
                                    : product.getStockQty()
                    );

                    return res;
                })
                .toList();
    }
}