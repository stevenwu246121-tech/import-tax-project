package com.example.importtax.controller;

import com.example.importtax.request.CreateOrderReq;
import com.example.importtax.response.CreateOrderRes;
import com.example.importtax.service.PurchaseOrderService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class PurchaseOrderController {

    private final PurchaseOrderService
            purchaseOrderService;

    public PurchaseOrderController(
            PurchaseOrderService purchaseOrderService) {

        this.purchaseOrderService =
                purchaseOrderService;
    }

    @PostMapping
    public CreateOrderRes createOrder(
            @RequestBody
            CreateOrderReq request) {

        return purchaseOrderService
                .createOrder(request);
    }
}