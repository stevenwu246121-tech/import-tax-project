package com.example.importtax.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.importtax.request.ProductReq;
import com.example.importtax.response.ProductRes;
import com.example.importtax.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService) {

        this.productService = productService;
    }

    @GetMapping
    public List<ProductRes> getAll() {

        return productService.getAll();
    }
    
    @PostMapping
    public void create(@RequestBody ProductReq req) {
        productService.create(req);
    }
    
    @DeleteMapping("/{productId}")
    public void delete(
            @PathVariable Long productId) {

        productService.delete(productId);
    }
}