package com.example.importtax.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.importtax.entity.PurchaseOrder;
import com.example.importtax.request.CreateOrderReq;
import com.example.importtax.response.CreateOrderRes;
import com.example.importtax.response.PurchaseOrderDetailRes;
import com.example.importtax.response.PurchaseOrderListRes;
import com.example.importtax.service.PurchaseOrderService;

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
	public List<PurchaseOrderListRes> getOrders() {
		return purchaseOrderService.getOrders();
	}

	@GetMapping("/{orderId}")
	public PurchaseOrderDetailRes getOrderDetail(@PathVariable("orderId") Long orderId) {
		return purchaseOrderService.getOrderDetail(orderId);
	}
	
	@DeleteMapping("/{orderId}")
	public void deleteOrder(
	        @PathVariable("orderId") Long orderId
	) {
	    purchaseOrderService.deleteOrder(orderId);
	}
}