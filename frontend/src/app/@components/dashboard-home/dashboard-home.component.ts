import { AfterViewInit, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Chart, registerables } from 'chart.js';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';

import { HsCode } from '../../models/hs-code';
import { DialogService } from '../../@services/dialog.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  todayImportTotal = 0;

  totalDuty = 0;

  totalVat = 0;

  products: Product[] = [];

  previewProducts: Product[] = [];

  inventoryTotals: { [key: string]: number } = {};

  twdToJpyRate = 0;

  updateTime = '';

  selectedHsCode = '';

  dutyRate = 0;

  vatRate = 0;

  hsCodes: HsCode[] = [];

  selectedProductId: number | null = null;

  selectedPeriod = 7;

  private trendChart?: Chart;

  private taxChart?: Chart;

  private inventoryChart?: Chart;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    this.loadExchangeRate();

    this.loadHsCodes();
  }

  ngAfterViewInit(): void {
    this.createTaxChart();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response ?? [];

        this.previewProducts = this.products.slice(0, 3);

        this.todayImportTotal = this.products.reduce(
          (sum, product) => sum + product.unitPrice,
          0,
        );

        this.totalDuty = this.products.reduce(
          (sum, product) => sum + (product.unitPrice * product.dutyRate) / 100,
          0,
        );

        this.totalVat = this.products.reduce(
          (sum, product) => sum + (product.unitPrice * product.vatRate) / 100,
          0,
        );

        this.inventoryTotals = this.products.reduce(
          (acc: { [key: string]: number }, product: Product) => {
            const categoryName = product.categoryName || '未分類';

            if (!acc[categoryName]) {
              acc[categoryName] = 0;
            }

            acc[categoryName] += product.unitPrice ?? 0;

            return acc;
          },
          {},
        );

        if (this.products.length > 0 && !this.selectedProductId) {
          this.selectedProductId = this.products[0].id;
        }

        setTimeout(() => {
          this.createTrendChart();

          this.createInventoryChart();
        });
      },

      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  loadHsCodes(): void {
    this.apiService.getHsCodes().subscribe({
      next: (response: HsCode[]) => {
        this.hsCodes = response;
      },
      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  loadExchangeRate(): void {
    this.apiService.getJpyExchangeRate().subscribe({
      next: (response: number) => {
        this.twdToJpyRate = 1 / response;

        this.updateTime = new Date().toLocaleString();
      },

      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  onTrendFilterChange(): void {
    this.createTrendChart();
  }

  createTrendChart(): void {
    this.trendChart?.destroy();

    const selectedProduct = this.products.find(
      (product) => product.id === this.selectedProductId,
    );

    if (!selectedProduct) {
      return;
    }

    const baseScore = this.calculatePurchaseSuggestionScore(selectedProduct);

    this.trendChart = new Chart('trendChart', {
      type: 'line',

      data: {
        labels: this.generateDateLabels(this.selectedPeriod),

        datasets: [
          {
            label: `${selectedProduct.productName} 提前進貨建議指數`,
            data: this.generateTrendData(baseScore, this.selectedPeriod),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.15)',
            fill: true,
            tension: 0.4,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });
  }

  calculatePurchaseSuggestionScore(product: Product): number {
    const dutyRate = product.dutyRate ?? 0;

    const vatRate = product.vatRate ?? 0;

    const unitPrice = product.unitPrice ?? 0;

    const taxRiskScore = dutyRate * 4 + vatRate * 2;

    const priceImpactScore = unitPrice >= 1000 ? 20 : unitPrice >= 500 ? 10 : 5;

    return Math.min(100, Math.round(taxRiskScore + priceImpactScore));
  }

  generateDateLabels(days: number): string[] {
    const labels: string[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();

      date.setDate(date.getDate() - i);

      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }

    return labels;
  }

  generateTrendData(baseScore: number, days: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < days; i++) {
      const wave = Math.sin(i / 2) * 6;

      const growth = i * 0.3;

      const value = baseScore + wave + growth;

      result.push(Math.max(0, Math.min(100, Math.round(value))));
    }

    return result;
  }

  createInventoryChart(): void {
    this.inventoryChart?.destroy();

    const labels = Object.keys(this.inventoryTotals);

    const data = Object.values(this.inventoryTotals);

    if (labels.length === 0) {
      return;
    }

    this.inventoryChart = new Chart('inventoryChart', {
      type: 'pie',

      data: {
        labels,
        datasets: [
          {
            label: '庫存商品占比',
            data,
            backgroundColor: [
              '#2563eb',
              '#f43f5e',
              '#fb923c',
              '#facc15',
              '#14b8a6',
              '#8b5cf6',
            ],
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: 'right',
          },
        },

        layout: {
          padding: 8,
        },
      },
    });
  }

  createTaxChart(): void {
    this.taxChart?.destroy();

    this.taxChart = new Chart('taxChart', {
      type: 'bar',
      data: {
        labels: ['05/14', '05/15', '05/16', '05/17', '05/18', '05/19', '05/20'],
        datasets: [
          {
            label: 'Import Duty',
            data: [10000, 12000, 14000, 9000, 11000, 10800, 10200],
            backgroundColor: '#2563eb',
          },
          {
            label: 'Import VAT',
            data: [8000, 9500, 10200, 7600, 8500, 9200, 8800],
            backgroundColor: '#22c55e',
          },
        ],
      },
    });
  }

  searchHsCode(): void {
    const found = this.hsCodes.find(
      (item) => item.code === this.selectedHsCode.trim(),
    );

    if (!found) {
      this.dialogService.warning('查無此 HS Code');
      return;
    }

    this.dutyRate = found.dutyRate;

    this.vatRate = found.vatRate;
  }
}
