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
  private cachedJpyRate?: number;
  private exchangeRateTimer?: ReturnType<typeof setInterval>;

  isRegionMenuOpen = false;
  isDiningMenuOpen = false;

  twdToJpyRate = 0;
  updateTime = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadExchangeRate();

    this.exchangeRateTimer = setInterval(() => {
      this.loadExchangeRate();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.exchangeRateTimer) {
      clearInterval(this.exchangeRateTimer);
    }
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

loadJpyExchangeRate(): void {
  if (this.twdToJpyRate > 0) {
    this.exchangeRate = this.twdToJpyRate;
    this.cachedJpyRate = this.twdToJpyRate;
    this.selectedRegion = 'JP';
    this.onCheckoutSettingChange();
    return;
  }

  this.isLoadingExchangeRate = true;

  this.apiService.getJpyExchangeRate().subscribe({
    next: (rate: number) => {
      this.twdToJpyRate = rate;
      this.cachedJpyRate = rate;
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

loadExchangeRate(): void {
  this.apiService.getJpyExchangeRate().subscribe({
    next: (response: number) => {
      this.twdToJpyRate = response;
      this.updateTime = new Date().toLocaleString();

      if (this.selectedRegion === 'JP') {
        this.exchangeRate = response;
        this.cachedJpyRate = response;
      }
    },
    error: (error: unknown) => {
      console.error(error);
    },
  });
}
}
