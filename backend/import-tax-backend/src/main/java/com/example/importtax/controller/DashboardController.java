package com.example.importtax.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.importtax.response.DashboardSummaryRes;
import com.example.importtax.response.DashboardTrendRes;
import com.example.importtax.response.LowStockRes;
import com.example.importtax.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	@GetMapping("/summary")
	public DashboardSummaryRes getSummary() {
		return dashboardService.getSummary();
	}

	@GetMapping("/trend")
	public List<DashboardTrendRes> getTrend(@RequestParam("days") int days) {
		return dashboardService.getTrend(days);
	}

	@GetMapping("/low-stock")
	public List<LowStockRes> getLowStockProducts() {
		return dashboardService.getLowStockProducts();
	}
}