import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';

import { PurchaseOrder } from '../../models/purchase-order';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];

  orders: PurchaseOrder[] = [];

  lowStockProducts: Product[] = [];

  totalProductCount = 0;

  monthlyPurchaseTotal = 0;

  monthlyDutyTotal = 0;

  lowStockCount = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();

    this.loadOrders();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response;

        this.totalProductCount = this.products.length;

        this.lowStockProducts = this.products.filter(
          (product) => product.stockQty <= 10,
        );

        this.lowStockCount = this.lowStockProducts.length;
      },
      error: (error: unknown) => {
        console.error('商品資料載入失敗：', error);
      },
    });
  }

  loadOrders(): void {
    this.apiService.getOrders().subscribe({
      next: (response: PurchaseOrder[]) => {
        this.orders = response;

        this.calculateMonthlyStats();
      },
      error: (error: unknown) => {
        console.error('進貨紀錄載入失敗：', error);
      },
    });
  }

  calculateMonthlyStats(): void {
    const now = new Date();

    const currentYear = now.getFullYear();

    const currentMonth = now.getMonth();

    const monthlyOrders = this.orders.filter((order) => {
      if (!order.createdAt) {
        return false;
      }

      const orderDate = new Date(order.createdAt);

      return (
        orderDate.getFullYear() === currentYear &&
        orderDate.getMonth() === currentMonth
      );
    });

    this.monthlyPurchaseTotal = monthlyOrders.reduce(
      (total, order) => total + (order.landedCostTotal || 0),
      0,
    );

    this.monthlyDutyTotal = monthlyOrders.reduce(
      (total, order) => total + (order.dutyTotal || 0),
      0,
    );
  }

  getUnitLabel(unit?: string): string {
    switch (unit) {
      case 'kg':
        return '公斤 kg';
      case 'g':
        return '公克 g';
      default:
        return '-';
    }
  }
}
