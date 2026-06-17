import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';

import { PurchaseCalculateResponse } from '../../models/purchase-calculate-response';

import { PurchaseItemRequest } from '../../models/purchase-item-request';

type Region = 'TW' | 'JP';

type DiningType = 'DINE_IN' | 'TAKE_OUT';

@Component({
  selector: 'app-pos-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-checkout.component.html',
  styleUrls: ['./pos-checkout.component.scss'],
})
export class PosCheckoutComponent implements OnInit, OnDestroy {
  productList: Product[] = [];

  cart: {
    product: Product;
    quantity: number;
  }[] = [];

  calculationResult?: PurchaseCalculateResponse;

  selectedRegion: Region = 'TW';

  selectedDiningType: DiningType = 'DINE_IN';

  exchangeRate = 1;

  isLoadingExchangeRate = false;

  private exchangeRateTimer?: ReturnType<typeof setInterval>;

  isRegionMenuOpen = false;

  isDiningMenuOpen = false;

  showCart = false;

  twdToJpyRate = 0;

  updateTime = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();

    this.loadExchangeRate();

    this.exchangeRateTimer = setInterval(
      () => {
        this.loadExchangeRate();
      },
      5 * 60 * 1000,
    );
  }

  ngOnDestroy(): void {
    if (this.exchangeRateTimer) {
      clearInterval(this.exchangeRateTimer);
    }
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get currencyLabel(): string {
    return this.selectedRegion === 'TW' ? 'NT$ ' : 'JP¥ ';
  }

  get exchangeRateTitle(): string {
    return this.selectedRegion === 'TW' ? '日幣換台幣' : '台幣換日幣';
  }

  get exchangeRatePrefix(): string {
    return this.selectedRegion === 'TW' ? '1 JP¥ =' : '1 NT$ =';
  }

  get displayExchangeRate(): number {
    if (this.twdToJpyRate <= 0) {
      return 0;
    }

    return this.selectedRegion === 'TW'
      ? 1 / this.twdToJpyRate
      : this.twdToJpyRate;
  }

  get exchangeRateUnit(): string {
    return this.selectedRegion === 'TW' ? 'NT$' : 'JP¥';
  }

  get regionLabel(): string {
    return this.selectedRegion === 'TW' ? '台灣 TW' : '日本 JP';
  }

  get diningTypeLabel(): string {
    return this.selectedDiningType === 'DINE_IN' ? '內用' : '外帶';
  }

  get diningTypeDescription(): string {
    return this.selectedDiningType === 'DINE_IN'
      ? '內用結帳模式'
      : '外帶結帳模式';
  }

  get posVatRateLabel(): string {
    if (this.selectedRegion === 'JP') {
      return `${this.getEffectiveVatRate()}%`;
    }

    return '依商品稅率';
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.isRegionMenuOpen = false;

    this.isDiningMenuOpen = false;
  }

  toggleRegionMenu(event: MouseEvent): void {
    event.stopPropagation();

    this.isRegionMenuOpen = !this.isRegionMenuOpen;

    this.isDiningMenuOpen = false;
  }

  toggleDiningMenu(event: MouseEvent): void {
    event.stopPropagation();

    this.isDiningMenuOpen = !this.isDiningMenuOpen;

    this.isRegionMenuOpen = false;
  }

  selectRegion(region: Region): void {
    this.isRegionMenuOpen = false;

    if (region === this.selectedRegion) {
      return;
    }

    if (region === 'TW') {
      this.selectedRegion = 'TW';

      this.exchangeRate = 1;

      this.onCheckoutSettingChange();

      return;
    }

    this.loadJpyExchangeRate();
  }

  selectDiningType(type: DiningType): void {
    this.isDiningMenuOpen = false;

    if (type === this.selectedDiningType) {
      return;
    }

    this.selectedDiningType = type;

    this.onCheckoutSettingChange();
  }

  onCheckoutSettingChange(): void {
    this.calculate();
  }

  toggleCart(): void {
    this.showCart = !this.showCart;
  }

  openCart(): void {
    this.showCart = true;
  }

  closeCart(): void {
    this.showCart = false;
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.productList = response ?? [];
      },
      error: (error: unknown) => {
        console.error('無法載入商品清單', error);
      },
    });
  }

  loadExchangeRate(): void {
    this.apiService.getJpyExchangeRate().subscribe({
      next: (response: number) => {
        this.twdToJpyRate = response;

        this.updateTime = new Date().toLocaleString();

        if (this.selectedRegion === 'JP') {
          this.exchangeRate = response;
        }
      },
      error: (error: unknown) => {
        console.error('匯率取得失敗', error);
      },
    });
  }

  loadJpyExchangeRate(): void {
    if (this.twdToJpyRate > 0) {
      this.exchangeRate = this.twdToJpyRate;

      this.selectedRegion = 'JP';

      this.onCheckoutSettingChange();

      return;
    }

    this.isLoadingExchangeRate = true;

    this.apiService.getJpyExchangeRate().subscribe({
      next: (rate: number) => {
        this.twdToJpyRate = rate;

        this.exchangeRate = rate;

        this.selectedRegion = 'JP';

        this.isLoadingExchangeRate = false;

        this.updateTime = new Date().toLocaleString();

        this.onCheckoutSettingChange();
      },
      error: (error: unknown) => {
        console.error('匯率取得失敗，使用預設匯率', error);

        this.twdToJpyRate = 4.5;

        this.exchangeRate = 4.5;

        this.selectedRegion = 'JP';

        this.isLoadingExchangeRate = false;

        this.updateTime = new Date().toLocaleString();

        this.onCheckoutSettingChange();
      },
    });
  }

  convertCurrency(amount: number | null | undefined): number {
    return (amount ?? 0) * this.exchangeRate;
  }

  addToCart(product: Product): void {
    const existingItem = this.cart.find(
      (item) => item.product.id === product.id,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        product,
        quantity: 1,
      });
    }

    this.calculate();
  }

  updateQuantity(index: number, change: number): void {
    const targetItem = this.cart[index];

    if (!targetItem) {
      return;
    }

    targetItem.quantity += change;

    if (targetItem.quantity <= 0) {
      this.cart.splice(index, 1);
    }

    this.calculate();
  }

  onCartQuantityInput(index: number, event: Event): void {
    const targetItem = this.cart[index];

    if (!targetItem) {
      return;
    }

    const input = event.target as HTMLInputElement;

    if (input.value === '') {
      return;
    }

    let quantity = Number(input.value);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      quantity = 1;
    }

    quantity = Math.floor(quantity);

    targetItem.quantity = quantity;

    input.value = String(quantity);

    this.calculate();
  }

  onCartQuantityBlur(index: number, event: Event): void {
    const targetItem = this.cart[index];

    if (!targetItem) {
      return;
    }

    const input = event.target as HTMLInputElement;

    if (input.value !== '') {
      return;
    }

    targetItem.quantity = 1;

    input.value = '1';

    this.calculate();
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);

    this.calculate();
  }

  clearCart(): void {
    this.cart = [];

    this.calculationResult = undefined;
  }

  getCartItemSubtotal(item: { product: Product; quantity: number }): number {
    return (item.product.unitPrice ?? 0) * item.quantity;
  }

  calculate(): void {
    if (this.cart.length === 0) {
      this.calculationResult = undefined;

      return;
    }

    const items: PurchaseItemRequest[] = this.cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    this.apiService.calculatePurchase({ items }).subscribe({
      next: (response: PurchaseCalculateResponse) => {
        this.calculationResult = this.applyPosVatRule(response);
      },
      error: (error: unknown) => {
        console.error('POS 稅額計算失敗', error);
      },
    });
  }

  getEffectiveVatRate(product?: Product, originalVatRate?: number): number {
    if (this.selectedRegion === 'JP') {
      if (this.selectedDiningType === 'DINE_IN') {
        return 8;
      }

      if (this.selectedDiningType === 'TAKE_OUT') {
        return 10;
      }
    }

    return product?.vatRate ?? originalVatRate ?? 5;
  }

  private applyPosVatRule(
    response: PurchaseCalculateResponse,
  ): PurchaseCalculateResponse {
    const adjustedItems = response.items.map((item, index) => {
      const cartItem = this.cart[index];

      const product = cartItem?.product;

      const vatRate = this.getEffectiveVatRate(product, item.vatRate);

      const subtotal = item.subtotal ?? 0;

      const dutyAmount = item.dutyAmount ?? 0;

      const vatAmount = this.roundMoney(
        (subtotal + dutyAmount) * (vatRate / 100),
      );

      const landedCost = this.roundMoney(subtotal + dutyAmount + vatAmount);

      return {
        ...item,
        vatRate,
        vatAmount,
        landedCost,
      };
    });

    const subtotal = this.roundMoney(
      adjustedItems.reduce((sum, item) => sum + (item.subtotal ?? 0), 0),
    );

    const dutyTotal = this.roundMoney(
      adjustedItems.reduce((sum, item) => sum + (item.dutyAmount ?? 0), 0),
    );

    const vatTotal = this.roundMoney(
      adjustedItems.reduce((sum, item) => sum + (item.vatAmount ?? 0), 0),
    );

    const landedCostTotal = this.roundMoney(
      adjustedItems.reduce((sum, item) => sum + (item.landedCost ?? 0), 0),
    );

    return {
      ...response,
      items: adjustedItems,
      subtotal,
      dutyTotal,
      vatTotal,
      landedCostTotal,
    };
  }

  private roundMoney(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
