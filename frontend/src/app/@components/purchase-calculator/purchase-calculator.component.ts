import { CommonModule } from '@angular/common';

import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { ApiService } from '../../@services/api.service';

import { DialogService } from '../../@services/dialog.service';

import { Product } from '../../models/product';

interface PurchaseCartItem {
  product: Product;

  quantity: number;

  subtotal: number;

  dutyAmount: number;

  vatAmount: number;

  landedCost: number;
}

@Component({
  selector: 'app-purchase-calculator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './purchase-calculator.component.html',
  styleUrl: './purchase-calculator.component.scss',
})
export class PurchaseCalculatorComponent implements OnInit {
  products: Product[] = [];

  cartItems: PurchaseCartItem[] = [];

  quantityMap: { [productId: number]: number } = {};

  importCountry = 'TW';

  originCountry = 'JP';

  currencyCode = 'JPY';

  exchangeRate = 0.21;

  totalQuantity = 0;

  subtotal = 0;

  dutyTotal = 0;

  vatTotal = 0;

  landedCostTotal = 0;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response ?? [];

        this.products.forEach((product) => {
          this.quantityMap[product.id] = 1;
        });
      },

      error: (error: unknown) => {
        console.error(error);

        this.dialogService.error('商品資料載入失敗');
      },
    });
  }

  addToCart(product: Product): void {
    const quantity = this.quantityMap[product.id] ?? 1;

    if (quantity <= 0) {
      this.dialogService.warning('數量需大於 0');
      return;
    }

    const existingItem = this.cartItems.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;

      this.recalculateItem(existingItem);

      this.calculateTotals();

      return;
    }

    const item: PurchaseCartItem = {
      product,

      quantity,

      subtotal: 0,

      dutyAmount: 0,

      vatAmount: 0,

      landedCost: 0,
    };

    this.recalculateItem(item);

    this.cartItems.push(item);

    this.calculateTotals();
  }

  recalculateItem(item: PurchaseCartItem): void {
    const unitPrice = item.product.unitPrice ?? 0;

    const dutyRate = item.product.dutyRate ?? 0;

    const vatRate = item.product.vatRate ?? 0;

    item.subtotal = unitPrice * item.quantity;

    item.dutyAmount = item.subtotal * dutyRate / 100;

    item.vatAmount =
      (item.subtotal + item.dutyAmount) * vatRate / 100;

    item.landedCost =
      item.subtotal + item.dutyAmount + item.vatAmount;
  }

  calculateTotals(): void {
    this.totalQuantity = this.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    this.subtotal = this.cartItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    this.dutyTotal = this.cartItems.reduce(
      (sum, item) => sum + item.dutyAmount,
      0
    );

    this.vatTotal = this.cartItems.reduce(
      (sum, item) => sum + item.vatAmount,
      0
    );

    this.landedCostTotal = this.cartItems.reduce(
      (sum, item) => sum + item.landedCost,
      0
    );
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(
      (item) => item.product.id !== productId
    );

    this.calculateTotals();
  }

  clearCart(): void {
    this.cartItems = [];

    this.calculateTotals();
  }

  createPurchaseOrder(): void {
    if (this.cartItems.length === 0) {
      this.dialogService.warning('購物車沒有商品');
      return;
    }

    const request = {
      importCountry: this.importCountry,

      originCountry: this.originCountry,

      currencyCode: this.currencyCode,

      exchangeRate: this.exchangeRate,

      items: this.cartItems.map((item) => ({
        productId: item.product.id,

        quantity: item.quantity,
      })),
    };

    this.apiService.createOrder(request).subscribe({
      next: () => {
        this.dialogService.success('進貨單建立成功');

        this.clearCart();

        this.router.navigate([
          '/purchase-history'
        ]);
      },

      error: (error: unknown) => {
        console.error(error);

        this.dialogService.error('進貨單建立失敗');
      },
    });
  }
}
