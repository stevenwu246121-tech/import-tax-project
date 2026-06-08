package com.example.importtax.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.example.importtax.entity.HsCode;
import com.example.importtax.request.HsCodeReq;
import com.example.importtax.response.HsCodeRes;
import com.example.importtax.service.HsCodeService;

@RestController
@RequestMapping("/api/hs-codes")
public class HsCodeController {

	private final HsCodeService hsCodeService;

	public HsCodeController(HsCodeService hsCodeService) {
		this.hsCodeService = hsCodeService;
	}

	@GetMapping
	public List<HsCode> getAll() {
		return hsCodeService.getAll();
	}

	@PostMapping
	public void create(@RequestBody HsCodeReq req) {
		hsCodeService.create(req);
	}

	@PutMapping("/{id}")
	public void update(@PathVariable("id") Long id, @RequestBody HsCodeReq req) {
		hsCodeService.update(id, req);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable("id") Long id) {
		hsCodeService.delete(id);
	}

	@GetMapping("/search")
	public List<HsCodeRes> searchHsCodes(@RequestParam("keyword") String keyword) {
		return hsCodeService.searchHsCodes(keyword);
	}

	@GetMapping("/recommend")
	public HsCodeRes recommendHsCode(@RequestParam("keyword") String keyword) {
		return hsCodeService.recommendHsCode(keyword);
	}
}