package com.example.importtax.controller;

import org.springframework.web.bind.annotation.*;

import com.example.importtax.request.PurchaseCalculateReq;
import com.example.importtax.response.PurchaseCalculateRes;
import com.example.importtax.service.PurchaseService;

@RestController
@RequestMapping("/api/purchase")
public class PurchaseController {

	private final PurchaseService purchaseService;

	public PurchaseController(PurchaseService purchaseService) {

		this.purchaseService = purchaseService;
	}

	@PostMapping("/calculate")
	public PurchaseCalculateRes calculate(@RequestBody PurchaseCalculateReq request) {

		return purchaseService.calculate(request);
	}
}