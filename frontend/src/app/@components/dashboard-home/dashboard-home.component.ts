import { Component, OnInit, OnDestroy } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Chart, registerables } from 'chart.js';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';

import { HsCode } from '../../models/hs-code';

import { DialogService } from '../../@services/dialog.service';
import { DashboardTrend } from '../../models/dashboard-trend';
import { LowStock } from '../../models/low-stock';

Chart.register(...registerables);
type ExchangeRateMode = 'TWD_TO_JPY' | 'JPY_TO_TWD';
@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
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

  exchangeRateMode: ExchangeRateMode = 'TWD_TO_JPY';

  updateTime = '';

  selectedPeriod = 7;

  trendData: DashboardTrend[] = [];

  lowStockProducts: LowStock[] = [];

  // HS Code 快速查詢
  hsCodeKeyword = '';

  hsCodeSearchResults: HsCode[] = [];

  selectedQuickHsCode: HsCode | null = null;

  hsCodeSearchMessage = '';

  private trendChart?: Chart;

  private taxChart?: Chart;

  private inventoryChart?: Chart;

  private exchangeRateTimer?: ReturnType<typeof setInterval>;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {}
  ngOnDestroy(): void {
    if (this.exchangeRateTimer) {
      clearInterval(this.exchangeRateTimer);
    }

    this.trendChart?.destroy();
    this.taxChart?.destroy();
    this.inventoryChart?.destroy();
  }

  ngOnInit(): void {
    this.loadDashboardSummary();

    this.loadProducts();

    this.loadDashboardTrend();

    this.loadExchangeRate();

    this.startExchangeRateAutoRefresh();

    this.loadLowStockProducts();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response ?? [];

        this.previewProducts = this.products.slice(0, 3);

        this.calculateInventoryTotals(this.products);

        setTimeout(() => {
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

  loadExchangeRate(showError = true): void {
    this.apiService.getJpyExchangeRate().subscribe({
      next: (response: number) => {
        this.twdToJpyRate = response;

        this.updateTime = new Date().toLocaleString();
      },

      error: (error: unknown) => {
        console.error(error);

        if (showError) {
          this.dialogService.error('匯率資料載入失敗');
        }
      },
    });
  }
  get exchangeRateTitle(): string {
    return this.exchangeRateMode === 'TWD_TO_JPY' ? 'NT$ → JP¥' : 'JP¥ → NT$';
  }

  get exchangeRateText(): string {
    if (!this.twdToJpyRate) {
      return '-';
    }

    if (this.exchangeRateMode === 'TWD_TO_JPY') {
      return `1 NT$ = ${this.twdToJpyRate.toFixed(2)} JP¥`;
    }

    return `1 JP¥ = ${(1 / this.twdToJpyRate).toFixed(4)} NT$`;
  }

  toggleExchangeRateMode(): void {
    this.exchangeRateMode =
      this.exchangeRateMode === 'TWD_TO_JPY' ? 'JPY_TO_TWD' : 'TWD_TO_JPY';
  }

  startExchangeRateAutoRefresh(): void {
    this.exchangeRateTimer = setInterval(
      () => {
        this.loadExchangeRate(false);
      },
      1 * 60 * 1000,
    );
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
        labels: this.trendData.map((item) => {
          const date = new Date(item.date);

          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),

        datasets: [
          {
            label: `近 ${this.selectedPeriod} 天進貨金額`,

            data: this.trendData.map((item) => item.amount),

            borderColor: '#2563eb',

            backgroundColor: 'rgba(37,99,235,0.15)',

            fill: true,

            tension: 0.4,

            borderWidth: 3,

            pointRadius: 5,

            pointHoverRadius: 8,

            pointBackgroundColor: '#2563eb',

            pointBorderColor: '#ffffff',

            pointBorderWidth: 2,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: 'top',
          },
        },

        scales: {
          y: {
            beginAtZero: true,

            ticks: {
              callback: function (value) {
                return 'NT$ ' + value;
              },
            },
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

    const entries = Object.entries(this.inventoryTotals)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);

    const labels = entries.map(([label]) => label);

    const data = entries.map(([, value]) => value);

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
              '#64748b',
              '#22c55e',
              '#ec4899',
              '#0ea5e9',
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

          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';

                const value = Number(context.raw ?? 0);

                return `${label}：${value} 件庫存`;
              },
            },
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

        const dutyAmount = (unitPrice * dutyRate) / 100;

        const vatAmount = ((unitPrice + dutyAmount) * vatRate) / 100;

        return {
          productName: product.productName,
          totalTax: dutyAmount + vatAmount,
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

  searchQuickHsCode(): void {
    const keyword = this.hsCodeKeyword.trim();

    if (!keyword) {
      this.hsCodeSearchResults = [];
      this.selectedQuickHsCode = null;
      this.hsCodeSearchMessage = '請輸入商品名稱、HS Code 或關鍵字';
      return;
    }

    this.apiService.searchHsCodes(keyword).subscribe({
      next: (response: HsCode[]) => {
        this.hsCodeSearchResults = response;

        if (response.length === 0) {
          this.selectedQuickHsCode = null;
          this.hsCodeSearchMessage = '查無符合的 HS Code';
          return;
        }

        this.selectedQuickHsCode = response[0];
        this.hsCodeSearchMessage = `共找到 ${response.length} 筆符合資料`;
      },
      error: (error: unknown) => {
        console.error(error);
        this.hsCodeSearchResults = [];
        this.selectedQuickHsCode = null;
        this.hsCodeSearchMessage = 'HS Code 查詢失敗';
        this.dialogService.error('HS Code 查詢失敗');
      },
    });
  }

  selectQuickHsCode(hsCode: HsCode): void {
    this.selectedQuickHsCode = hsCode;
  }

  clearQuickHsCodeSearch(): void {
    this.hsCodeKeyword = '';
    this.hsCodeSearchResults = [];
    this.selectedQuickHsCode = null;
    this.hsCodeSearchMessage = '';
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
        this.trendData = response ?? [];

        setTimeout(() => {
          this.createTrendChart();
        });
      },
      error: (error) => {
        console.error(error);

        this.dialogService.error('進貨趨勢資料載入失敗');
      },
    });
  }

  loadLowStockProducts(): void {
    this.apiService.getLowStockProducts().subscribe({
      next: (response) => {
        this.lowStockProducts = response;
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  calculateInventoryTotals(products: Product[]): void {
    const totals: { [key: string]: number } = {};

    products.forEach((product) => {
      const categoryName = product.categoryName?.trim() || '未分類';

      const stockQty = product.stockQty ?? 0;

      if (!totals[categoryName]) {
        totals[categoryName] = 0;
      }

      totals[categoryName] += stockQty;
    });

    this.inventoryTotals = totals;
  }
}
