import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { Product } from '../../models/product';

import { ApiService } from '../../@services/api.service';

import { PurchaseCalculateResponse } from '../../models/purchase-calculate-response';

import { DialogService } from '../../@services/dialog.service';

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

  currency = 'NT$ ';

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

  showCart = false;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get cartItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  toggleCart(): void {
    this.showCart = !this.showCart;
  }

  closeCart(): void {
    this.showCart = false;
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
      this.currency = 'NT$ ';

      this.exchangeRate = 1;

      this.recalculateIfCartHasItems();

      return;
    }

    this.currency = 'JP¥ ';

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

  getProductStock(productId: number): number {
    const product = this.products.find((item) => item.id === productId);

    return product?.stockQty ?? 0;
  }

  increaseCartItemQuantity(item: CartItem): void {
    const stockQty = this.getProductStock(item.productId);

    if (item.quantity >= stockQty) {
      this.dialogService.warning(`數量不可超過目前庫存 ${stockQty}`);
      return;
    }

    item.quantity++;

    this.calculate();
  }

  decreaseCartItemQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      return;
    }

    item.quantity--;

    this.calculate();
  }

  onCartQuantityInput(
    item: { productId: number; quantity: number },
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;

    if (input.value === '') {
      return;
    }

    const stockQty = this.getProductStock(item.productId);

    let quantity = Number(input.value);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      quantity = 1;

      item.quantity = quantity;

      input.value = String(quantity);

      this.calculate();

      return;
    }

    quantity = Math.floor(quantity);

    if (quantity > stockQty) {
      quantity = stockQty;

      item.quantity = quantity;

      input.value = String(quantity);

      this.dialogService.warning(`購物車數量不可超過目前庫存 ${stockQty}`);

      this.calculate();

      return;
    }

    item.quantity = quantity;

    input.value = String(quantity);

    this.calculate();
  }

  onCartQuantityBlur(
    item: { productId: number; quantity: number },
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;

    if (input.value !== '') {
      return;
    }

    item.quantity = 1;

    input.value = '1';

    this.calculate();
  }

  getCartProduct(productId: number): Product | undefined {
    return this.products.find((product) => product.id === productId);
  }

  getCartItemSubtotal(item: CartItem): number {
    const product = this.getCartProduct(item.productId);

    return (product?.unitPrice ?? 0) * item.quantity;
  }

  addToCart(product: Product): void {
    const stockQty = product.stockQty ?? 0;

    if (stockQty <= 0) {
      this.dialogService.warning('此商品目前沒有庫存');

      return;
    }

    const quantity = this.getQuantity(product.id);

    if (quantity <= 0) {
      this.dialogService.warning('請輸入正確數量');

      this.quantities[product.id] = 1;

      return;
    }

    if (quantity > stockQty) {
      this.dialogService.warning(`加入數量不可超過目前庫存 ${stockQty}`);

      this.quantities[product.id] = stockQty;

      return;
    }

    const existItem = this.cartItems.find(
      (item) => item.productId === product.id,
    );

    if (existItem) {
      const newQuantity = existItem.quantity + quantity;

      if (newQuantity > stockQty) {
        this.dialogService.warning(`購物車數量不可超過目前庫存 ${stockQty}`);

        return;
      }

      existItem.quantity = newQuantity;
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
      (item) => item.productId !== productId,
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

  private isCartStockValid(): boolean {
    for (const item of this.cartItems) {
      const stockQty = this.getProductStock(item.productId);

      if (item.quantity > stockQty) {
        this.dialogService.warning(
          `${item.productName} 庫存不足，目前庫存 ${stockQty}`,
        );

        return false;
      }
    }

    return true;
  }

  createPurchaseOrder(): void {
    if (this.cartItems.length === 0) {
      this.dialogService.warning('請先加入商品');

      return;
    }

    if (!this.isCartStockValid()) {
      return;
    }

    if (!this.isCartOriginCountryValid()) {
      return;
    }

    const firstCartItem = this.cartItems[0];

    const firstProduct = this.getCartProduct(firstCartItem.productId);

    const originCountry = firstProduct?.originCountry || 'JP';

    const request = {
      importCountry: 'TW',

      originCountry,

      currencyCode: this.selectedCountry === 'JP' ? 'JPY' : 'TWD',

      exchangeRate: this.selectedCountry === 'JP' ? this.exchangeRate : 1,

      items: this.cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    this.isCalculating = true;

    this.apiService.createOrder(request).subscribe({
      next: (response) => {
        this.isCalculating = false;

        this.dialogService.success(`進貨成功：${response.orderNo}`);

        this.clearCart();

        this.closeCart();

        this.loadProducts();

        this.router.navigate(['/purchase-history']);
      },

      error: (error: unknown) => {
        console.error(error);

        this.isCalculating = false;

        this.dialogService.error('建立進貨單失敗');
      },
    });
  }

  private isCartOriginCountryValid(): boolean {
    const originCountries = this.cartItems
      .map((item) => this.getCartProduct(item.productId)?.originCountry)
      .filter((country): country is string => !!country);

    const uniqueCountries = Array.from(new Set(originCountries));

    if (uniqueCountries.length > 1) {
      this.dialogService.warning('同一張進貨單不可混合不同來源國商品');

      return false;
    }

    return true;
  }
}
