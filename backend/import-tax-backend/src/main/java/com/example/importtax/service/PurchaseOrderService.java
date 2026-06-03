package com.example.importtax.service;

import com.example.importtax.dao.ProductDao;
import com.example.importtax.dao.PurchaseOrderDao;
import com.example.importtax.dao.PurchaseOrderItemDao;
import com.example.importtax.entity.Product;
import com.example.importtax.entity.PurchaseOrder;
import com.example.importtax.entity.PurchaseOrderItem;
import com.example.importtax.request.CreateOrderReq;
import com.example.importtax.request.OrderItemReq;
import com.example.importtax.response.CreateOrderRes;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PurchaseOrderService {

	private final PurchaseOrderDao purchaseOrderRepository;

	private final PurchaseOrderItemDao purchaseOrderItemRepository;

	private final ProductDao productRepository;

	public PurchaseOrderService(PurchaseOrderDao purchaseOrderRepository,
			PurchaseOrderItemDao purchaseOrderItemRepository, ProductDao productRepository) {

		this.purchaseOrderRepository = purchaseOrderRepository;
		this.purchaseOrderItemRepository = purchaseOrderItemRepository;
		this.productRepository = productRepository;
	}

	@Transactional
	public CreateOrderRes createOrder(CreateOrderReq request) {

		PurchaseOrder order = new PurchaseOrder();

		order.setOrderNo(generateOrderNo());

		order.setSupplierName("SYSTEM");

		order.setImportCountry(request.getImportCountry());

		order.setOriginCountry(request.getOriginCountry());

		order.setCurrencyCode(request.getCurrencyCode());

		order.setExchangeRate(request.getExchangeRate());

		order.setStatus("CONFIRMED");

		BigDecimal subtotal = BigDecimal.ZERO;

		BigDecimal dutyTotal = BigDecimal.ZERO;

		BigDecimal vatTotal = BigDecimal.ZERO;

		BigDecimal landedCostTotal = BigDecimal.ZERO;

		purchaseOrderRepository.save(order);

		for (OrderItemReq itemRequest : request.getItems()) {

			Product product = productRepository.findById(itemRequest.getProductId()).orElseThrow();

			BigDecimal quantity = BigDecimal.valueOf(itemRequest.getQuantity());

			BigDecimal itemSubtotal = product.getUnitPrice().multiply(quantity);

			/*
			 * 先寫死稅率 之後改 ImportTaxRule
			 */
			if (product.getHsCode() == null) {
				throw new RuntimeException("Product " + product.getName() + " 未設定 HS Code");
			}

			BigDecimal dutyRate = product.getHsCode().getDutyRate();

			BigDecimal vatRate = product.getHsCode().getVatRate();

			BigDecimal dutyAmount = itemSubtotal.multiply(dutyRate).divide(BigDecimal.valueOf(100));

			BigDecimal vatAmount = itemSubtotal.add(dutyAmount).multiply(vatRate).divide(BigDecimal.valueOf(100));

			BigDecimal landedCost = itemSubtotal.add(dutyAmount).add(vatAmount);

			PurchaseOrderItem orderItem = new PurchaseOrderItem();

			orderItem.setPurchaseOrder(order);

			orderItem.setProduct(product);

			orderItem.setQuantity(itemRequest.getQuantity());

			orderItem.setUnitPrice(product.getUnitPrice());

			orderItem.setSubtotal(itemSubtotal);

			orderItem.setDutyRate(dutyRate);

			orderItem.setDutyAmount(dutyAmount);

			orderItem.setVatRate(vatRate);

			orderItem.setVatAmount(vatAmount);

			orderItem.setLandedCost(landedCost);

			purchaseOrderItemRepository.save(orderItem);

			subtotal = subtotal.add(itemSubtotal);

			dutyTotal = dutyTotal.add(dutyAmount);

			vatTotal = vatTotal.add(vatAmount);

			landedCostTotal = landedCostTotal.add(landedCost);
		}

		order.setSubtotal(subtotal);

		order.setDutyTotal(dutyTotal);

		order.setVatTotal(vatTotal);

		order.setLandedCostTotal(landedCostTotal);

		purchaseOrderRepository.save(order);

		return new CreateOrderRes(order.getId(), order.getOrderNo(), order.getLandedCostTotal());
	}

	private String generateOrderNo() {

		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

		return "PO" + LocalDateTime.now().format(formatter);
	}
	
	public List<PurchaseOrder> getOrders() {

	    return purchaseOrderRepository
	            .findAllByOrderByCreatedAtDesc();
	}
}