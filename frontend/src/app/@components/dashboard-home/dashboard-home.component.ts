import { AfterViewInit, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Chart, registerables } from 'chart.js';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';

import { HsCode } from '../../models/hs-code';

import { DialogService } from '../../@services/dialog.service';
import { DashboardTrend } from '../../models/dashboard-trend';

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

  averageTaxRate = 0;

  landedCostTotal = 0;

  dutyPercentage = 0;

  vatPercentage = 0;

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

  trendData: DashboardTrend[] = [];

  private trendChart?: Chart;

  private taxChart?: Chart;

  private inventoryChart?: Chart;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardSummary();

    this.loadProducts();

    this.loadDashboardTrend();

    this.loadExchangeRate();

    this.loadHsCodes();
  }

  ngAfterViewInit(): void {}

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response ?? [];

        this.previewProducts = this.products.slice(0, 3);

        this.todayImportTotal = this.products.reduce(
          (sum, product) => sum + (product.unitPrice ?? 0),
          0,
        );

        this.totalDuty = this.products.reduce(
          (sum, product) =>
            sum + ((product.unitPrice ?? 0) * (product.dutyRate ?? 0)) / 100,
          0,
        );

        this.totalVat = this.products.reduce(
          (sum, product) =>
            sum + ((product.unitPrice ?? 0) * (product.vatRate ?? 0)) / 100,
          0,
        );

        this.averageTaxRate =
          this.todayImportTotal > 0
            ? ((this.totalDuty + this.totalVat) / this.todayImportTotal) * 100
            : 0;
        this.dutyPercentage =
          this.todayImportTotal > 0
            ? (this.totalDuty / this.todayImportTotal) * 100
            : 0;

        this.vatPercentage =
          this.todayImportTotal > 0
            ? (this.totalVat / this.todayImportTotal) * 100
            : 0;
        this.landedCostTotal =
          this.todayImportTotal + this.totalDuty + this.totalVat;

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

          this.createTaxRankingChart();
        });
      },

      error: (error: unknown) => {
        console.error(error);

        this.dialogService.error('商品資料載入失敗');
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

        this.dialogService.error('HS Code 資料載入失敗');
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

        this.dialogService.error('匯率資料載入失敗');
      },
    });
  }

  onTrendFilterChange(): void {
    this.loadDashboardTrend();
  }

  createTrendChart(): void {
    this.trendChart?.destroy();

    const canvas = document.getElementById(
      'trendChart',
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return;
    }

    this.trendChart = new Chart(canvas, {
      type: 'line',

      data: {
        labels: this.trendData.map((item) => item.date),

        datasets: [
          {
            label: `近 ${this.selectedPeriod} 天進貨金額`,
            data: this.trendData.map((item) => item.amount),
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
          },
        },
      },
    });
  }

  createInventoryChart(): void {
    this.inventoryChart?.destroy();

    const canvas = document.getElementById(
      'inventoryChart',
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return;
    }

    const labels = Object.keys(this.inventoryTotals);

    const data = Object.values(this.inventoryTotals);

    if (labels.length === 0) {
      return;
    }

    this.inventoryChart = new Chart(canvas, {
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

  createTaxRankingChart(): void {
    this.taxChart?.destroy();

    const canvas = document.getElementById(
      'taxRankingChart',
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return;
    }

    const taxRanking = this.products
      .map((product) => {
        const unitPrice = product.unitPrice ?? 0;
        const dutyRate = product.dutyRate ?? 0;
        const vatRate = product.vatRate ?? 0;

        return {
          productName: product.productName,
          totalTax: (unitPrice * dutyRate) / 100 + (unitPrice * vatRate) / 100,
        };
      })
      .sort((a, b) => b.totalTax - a.totalTax)
      .slice(0, 5);

    if (taxRanking.length === 0) {
      return;
    }

    this.taxChart = new Chart(canvas, {
      type: 'bar',

      data: {
        labels: taxRanking.map((item) => item.productName),

        datasets: [
          {
            label: '商品稅負金額',
            data: taxRanking.map((item) => item.totalTax),
            backgroundColor: '#2563eb',
          },
        ],
      },

      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
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

  loadDashboardSummary(): void {
    this.apiService.getDashboardSummary().subscribe({
      next: (response) => {
        this.todayImportTotal = response.totalImportAmount;

        this.totalDuty = response.totalDuty;

        this.totalVat = response.totalVat;

        this.averageTaxRate = response.averageTaxRate;

        this.landedCostTotal = response.landedCostTotal;

        this.dutyPercentage =
          this.todayImportTotal > 0
            ? (this.totalDuty / this.todayImportTotal) * 100
            : 0;

        this.vatPercentage =
          this.todayImportTotal > 0
            ? (this.totalVat / this.todayImportTotal) * 100
            : 0;
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  loadDashboardTrend(): void {
    this.apiService.getDashboardTrend(this.selectedPeriod).subscribe({
      next: (response) => {
        this.trendData = response;
        this.createTrendChart();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
