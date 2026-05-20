package com.example.importtax.request;

import java.util.List;

public class PurchaseCalculateReq {
	private List<PurchaseItemReq> items;

	public List<PurchaseItemReq> getItems() {
		return items;
	}

	public void setItems(List<PurchaseItemReq> items) {
		this.items = items;
	}
}