import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';
import { Product } from '../../models/product';
import { PurchaseCalculateResponse } from '../../models/purchase-calculate-response';
import { PurchaseItemRequest } from '../../models/purchase-item-request';

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

  selectedRegion = 'TW';

  selectedDiningType = 'DINE_IN';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
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
