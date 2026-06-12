package com.example.importtax.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.importtax.response.OfficialHsCodeSyncRes;
import com.example.importtax.service.HsCodeOfficialSyncService;

@RestController
@RequestMapping("/api/hs-codes")
public class HsCodeOfficialSyncController {

	private final HsCodeOfficialSyncService hsCodeOfficialSyncService;

	public HsCodeOfficialSyncController(HsCodeOfficialSyncService hsCodeOfficialSyncService) {
		this.hsCodeOfficialSyncService = hsCodeOfficialSyncService;
	}

	@PostMapping("/sync-official")
	public OfficialHsCodeSyncRes syncOfficialData() {
		return hsCodeOfficialSyncService.syncOfficialData();
	}
}