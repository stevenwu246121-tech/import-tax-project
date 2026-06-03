package com.example.importtax.controller;

import com.example.importtax.entity.PurchaseOrder;
import com.example.importtax.request.CreateOrderReq;
import com.example.importtax.response.CreateOrderRes;
import com.example.importtax.service.PurchaseOrderService;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class PurchaseOrderController {

	private final PurchaseOrderService purchaseOrderService;

	public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {

		this.purchaseOrderService = purchaseOrderService;
	}

	@PostMapping
	public CreateOrderRes createOrder(@RequestBody CreateOrderReq request) {

		return purchaseOrderService.createOrder(request);
	}

	@GetMapping
	public List<PurchaseOrder> getOrders() {

		return purchaseOrderService.getOrders();
	}

	@GetMapping("/{orderId}")
	public PurchaseOrder getOrderDetail(@PathVariable Long orderId) {
		return purchaseOrderService.getOrderDetail(orderId);
	}
}