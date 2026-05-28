import { Component, OnInit } from '@angular/core';
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
export class PosCheckoutComponent implements OnInit {
  productList: Product[] = [];

  cart: {
    product: Product;
    quantity: number;
  }[] = [];

  calculationResult?: PurchaseCalculateResponse;

  selectedRegion: Region = 'TW';
  selectedDiningType: DiningType = 'DINE_IN';

  isRegionMenuOpen = false;
  isDiningMenuOpen = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  get currencyLabel(): string {
    return this.selectedRegion === 'TW' ? 'TWD' : 'JPY';
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

  toggleRegionMenu(): void {
    this.isRegionMenuOpen = !this.isRegionMenuOpen;
    this.isDiningMenuOpen = false;
  }

  toggleDiningMenu(): void {
    this.isDiningMenuOpen = !this.isDiningMenuOpen;
    this.isRegionMenuOpen = false;
  }

  selectRegion(region: Region): void {
    this.selectedRegion = region;
    this.isRegionMenuOpen = false;
    this.onCheckoutSettingChange();
  }

  selectDiningType(type: DiningType): void {
    this.selectedDiningType = type;
    this.isDiningMenuOpen = false;
    this.onCheckoutSettingChange();
  }

  onCheckoutSettingChange(): void {
    this.calculate();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.productList = response;
      },
      error: (error: unknown) => {
        console.error('無法載入商品清單', error);
      },
    });
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
    this.cart[index].quantity += change;

    if (this.cart[index].quantity <= 0) {
      this.cart.splice(index, 1);
    }

    this.calculate();
  }

  clearCart(): void {
    this.cart = [];
    this.calculationResult = undefined;
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
        this.calculationResult = response;
      },
      error: (error: unknown) => {
        console.error('POS 稅額計算失敗', error);
      },
    });
  }
}
