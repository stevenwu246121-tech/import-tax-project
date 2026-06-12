package com.example.importtax.response;

public class OfficialHsCodeSyncRes {

	private int totalCount;

	private int createdCount;

	private int updatedCount;

	public OfficialHsCodeSyncRes() {
	}

	public OfficialHsCodeSyncRes(int totalCount, int createdCount, int updatedCount) {
		this.totalCount = totalCount;
		this.createdCount = createdCount;
		this.updatedCount = updatedCount;
	}

	public int getTotalCount() {
		return totalCount;
	}

	public void setTotalCount(int totalCount) {
		this.totalCount = totalCount;
	}

	public int getCreatedCount() {
		return createdCount;
	}

	public void setCreatedCount(int createdCount) {
		this.createdCount = createdCount;
	}

	public int getUpdatedCount() {
		return updatedCount;
	}

	public void setUpdatedCount(int updatedCount) {
		this.updatedCount = updatedCount;
	}
}