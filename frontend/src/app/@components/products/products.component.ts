import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product';
import { ApiService } from '../../@services/api.service';
import { PurchaseCalculateResponse } from '../../models/purchase-calculate-response';

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
}

interface PurchaseCalculateRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  selectedCountry: 'TW' | 'JP' = 'TW';

  currency = 'TWD';
  exchangeRate = 1;

  products: Product[] = [];
  quantities: Record<number, number> = {};
  cartItems: CartItem[] = [];

  calculateResponse?: PurchaseCalculateResponse;

  subtotal = 0;
  dutyTotal = 0;
  vatTotal = 0;
  landedCostTotal = 0;

  isLoadingProducts = false;
  isLoadingExchangeRate = false;
  isCalculating = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.errorMessage = '';

    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response ?? [];
        this.initializeQuantities();
        this.isLoadingProducts = false;
      },
      error: (error: unknown) => {
        console.error('商品載入失敗:', error);
        this.products = [];
        this.isLoadingProducts = false;
        this.errorMessage = '商品資料載入失敗，請確認後端服務是否正常。';
      },
    });
  }

  private initializeQuantities(): void {
    this.products.forEach((product) => {
      this.quantities[product.id] = this.quantities[product.id] || 1;
    });
  }

  convertCurrency(amount: number | undefined | null): number {
    return (amount ?? 0) * this.exchangeRate;
  }

  changeCountry(): void {
    if (this.selectedCountry === 'TW') {
      this.currency = 'TWD';
      this.exchangeRate = 1;
      this.recalculateIfCartHasItems();
      return;
    }

    this.currency = 'JPY';
    this.loadJpyExchangeRate();
  }

  private loadJpyExchangeRate(): void {
    this.isLoadingExchangeRate = true;

    this.apiService.getJpyExchangeRate().subscribe({
      next: (rate: number) => {
        this.exchangeRate = rate;
        this.isLoadingExchangeRate = false;
        this.recalculateIfCartHasItems();
      },
      error: (error: unknown) => {
        console.error('匯率取得失敗:', error);

        // 備援匯率，避免畫面完全不能用
        this.exchangeRate = 4.5;
        this.isLoadingExchangeRate = false;

        this.recalculateIfCartHasItems();
      },
    });
  }

  recalculateIfCartHasItems(): void {
    if (this.cartItems.length === 0) {
      return;
    }

    this.calculate();
  }

  getQuantity(productId: number): number {
    return this.quantities[productId] || 1;
  }

  addToCart(product: Product): void {
    const quantity = this.getQuantity(product.id);

    if (quantity <= 0) {
      alert('請輸入正確數量');
      this.quantities[product.id] = 1;
      return;
    }

    const existItem = this.cartItems.find(
      (item) => item.productId === product.id
    );

    if (existItem) {
      existItem.quantity += quantity;
    } else {
      this.cartItems.push({
        productId: product.id,
        productName: product.productName,
        quantity,
      });
    }

    this.quantities[product.id] = 1;
    this.calculate();
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(
      (item) => item.productId !== productId
    );

    this.recalculateIfCartHasItems();

    if (this.cartItems.length === 0) {
      this.resetCalculation();
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.resetCalculation();
  }

  calculate(): void {
    if (this.cartItems.length === 0) {
      this.resetCalculation();
      return;
    }

    const request = this.buildCalculateRequest();

    this.isCalculating = true;
    this.errorMessage = '';

    this.apiService.calculatePurchase(request).subscribe({
      next: (response: PurchaseCalculateResponse) => {
        this.calculateResponse = response;
        this.applyCalculationResult(response);
        this.isCalculating = false;
      },
      error: (error: unknown) => {
        console.error('進貨試算失敗:', error);
        this.isCalculating = false;
        this.errorMessage = '進貨試算失敗，請確認商品資料或後端服務。';
      },
    });
  }

  private buildCalculateRequest(): PurchaseCalculateRequest {
    return {
      items: this.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };
  }

  private applyCalculationResult(response: PurchaseCalculateResponse): void {
    this.subtotal = response.subtotal ?? 0;
    this.dutyTotal = response.dutyTotal ?? 0;
    this.vatTotal = response.vatTotal ?? 0;
    this.landedCostTotal = response.landedCostTotal ?? 0;
  }

  resetCalculation(): void {
    this.calculateResponse = undefined;
    this.subtotal = 0;
    this.dutyTotal = 0;
    this.vatTotal = 0;
    this.landedCostTotal = 0;
  }
}
