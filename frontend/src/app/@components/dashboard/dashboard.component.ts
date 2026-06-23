import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../@services/api.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  lowStockProducts: Product[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadLowStockProducts();
  }

  loadLowStockProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        const products = response ?? [];

        this.lowStockProducts = products.filter(
          (product) => (product.stockQty ?? 0) <= 10,
        );
      },
      error: (error: unknown) => {
        console.error('低庫存商品資料載入失敗：', error);
      },
    });
  }

  getUnitLabel(unit?: string | null): string {
    switch (unit) {
      case 'kg':
        return '公斤 kg';

      case 'g':
        return '公克 g';

      case '包':
        return '包';

      case '盒':
        return '盒';

      case '瓶':
        return '瓶';

      case '袋':
        return '袋';

      default:
        return unit || '-';
    }
  }
}
