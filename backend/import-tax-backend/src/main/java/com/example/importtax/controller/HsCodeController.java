package com.example.importtax.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.importtax.entity.HsCode;
import com.example.importtax.service.HsCodeService;

@RestController
public class HsCodeController {

	private final HsCodeService hsCodeService;

	public HsCodeController(HsCodeService hsCodeService) {

		this.hsCodeService = hsCodeService;
	}

	@GetMapping("/api/hs-codes")
	public List<HsCode> getAll() {

		return hsCodeService.getAll();
	}
}