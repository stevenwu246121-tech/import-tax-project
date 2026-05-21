import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product';
import { ApiService } from '../../@services/api.service';
import { PurchaseCalculateResponse } from '../../models/purchase-calculate-response';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  selectedCountry = 'TW';
  currency = 'TWD';
  exchangeRate = 1;
  products: Product[] = [];

  convertCurrency(amount: number): number {
    return amount * this.exchangeRate;
  }

  quantities: {
    [productId: number]: number;
  } = {};

  cartItems: {
    productId: number;
    productName: string;
    quantity: number;
  }[] = [];

  calculateResponse?: PurchaseCalculateResponse;

  subtotal = 0;

  dutyTotal = 0;

  vatTotal = 0;

  landedCostTotal = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  changeCountry(): void {
    console.log('changeCountry:', this.selectedCountry);

    if (this.selectedCountry === 'TW') {
      this.currency = 'TWD';
      this.exchangeRate = 1;
      return;
    }

    this.currency = 'JPY';

    this.apiService.getJpyExchangeRate().subscribe({
      next: (rate: number) => {
        console.log('JPY Rate:', rate);
        this.exchangeRate = rate;
        this.calculate();
      },
      error: (error: unknown) => {
        console.error('匯率取得失敗', error);
        this.exchangeRate = 4.5;
        this.calculate();
      },
    });
  }
  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response;
      },
      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  addToCart(product: Product): void {
    const quantity = this.quantities[product.id];

    if (!quantity || quantity <= 0) {
      alert('請輸入正確數量');

      return;
    }

    const existItem = this.cartItems.find(
      (item) => item.productId === product.id,
    );

    if (existItem) {
      existItem.quantity += quantity;
    } else {
      this.cartItems.push({
        productId: product.id,

        productName: product.productName,

        quantity: quantity,
      });
    }

    this.quantities[product.id] = 0;

    this.calculate();
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(
      (item) => item.productId !== productId,
    );

    if (this.cartItems.length > 0) {
      this.calculate();
    } else {
      this.calculateResponse = undefined;

      this.subtotal = 0;

      this.dutyTotal = 0;

      this.vatTotal = 0;

      this.landedCostTotal = 0;
    }
  }

  clearCart(): void {
    this.cartItems = [];

    this.calculateResponse = undefined;

    this.subtotal = 0;

    this.dutyTotal = 0;

    this.vatTotal = 0;

    this.landedCostTotal = 0;
  }

  calculate(): void {
    if (this.cartItems.length === 0) {
      alert('購物車沒有商品');

      return;
    }

    const request = {
      items: this.cartItems.map((item) => ({
        productId: item.productId,

        quantity: item.quantity,
      })),
    };

    this.apiService.calculatePurchase(request).subscribe({
      next: (response: PurchaseCalculateResponse) => {
        console.log(response);

        this.calculateResponse = response;

        this.subtotal = response.subtotal;

        this.dutyTotal = response.dutyTotal;

        this.vatTotal = response.vatTotal;

        this.landedCostTotal = response.landedCostTotal;
      },

      error: (error: unknown) => {
        console.error(error);
      },
    });
  }
}
