package com.example.importtax.response;

import java.math.BigDecimal;

public class CreateOrderRes {
	private Long orderId;

    private String orderNo;

    private BigDecimal totalAmount;

    public CreateOrderRes() {
    }

    public CreateOrderRes(
            Long orderId,
            String orderNo,
            BigDecimal totalAmount) {

        this.orderId = orderId;
        this.orderNo = orderNo;
        this.totalAmount = totalAmount;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNo() {
        return orderNo;
    }

    public void setOrderNo(String orderNo) {
        this.orderNo = orderNo;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
