import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { ApiService } from '../../@services/api.service';
import { Product } from '../../models/product';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('purchaseTrendChart')
  purchaseTrendChartRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('inventoryPieChart')
  inventoryPieChartRef!: ElementRef<HTMLCanvasElement>;

  products: Product[] = [];

  selectedProductId: number | null = null;

  selectedPeriod = 7;

  isLoading = false;

  errorMessage = '';

  private viewReady = false;

  private purchaseTrendChart?: Chart;

  private inventoryPieChart?: Chart;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;

    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadProducts(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response ?? [];

        if (this.products.length > 0 && !this.selectedProductId) {
          this.selectedProductId = this.products[0].id;
        }

        this.isLoading = false;

        setTimeout(() => {
          this.renderCharts();
        });
      },

      error: (error: unknown) => {
        console.error(error);

        this.products = [];

        this.isLoading = false;

        this.errorMessage = 'Dashboard 資料載入失敗，請確認後端 API 是否正常。';

        this.destroyCharts();
      },
    });
  }

  onProductChange(): void {
    this.createPurchaseTrendChart();
  }

  onPeriodChange(): void {
    this.createPurchaseTrendChart();
  }

  private renderCharts(): void {
    if (
      !this.viewReady ||
      this.products.length === 0 ||
      !this.purchaseTrendChartRef ||
      !this.inventoryPieChartRef
    ) {
      return;
    }

    this.createPurchaseTrendChart();

    this.createInventoryPieChart();
  }

  private createPurchaseTrendChart(): void {
    this.purchaseTrendChart?.destroy();

    this.purchaseTrendChart = undefined;

    const selectedProduct = this.products.find(
      (product) => product.id === this.selectedProductId,
    );

    if (!selectedProduct || !this.purchaseTrendChartRef) {
      return;
    }

    const baseScore = this.calculatePurchaseSuggestionScore(selectedProduct);

    const labels = this.generateDateLabels(this.selectedPeriod);

    const trendData = this.generateTrendData(baseScore, this.selectedPeriod);

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${selectedProduct.productName} 提前進貨建議指數`,
            data: trendData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.14)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `建議指數 ${context.raw}：可評估是否提前進貨`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 100,
            ticks: {
              callback: (value) => `${value}`,
            },
          },
        },
      },
    };

    this.purchaseTrendChart = new Chart(
      this.purchaseTrendChartRef.nativeElement,
      config,
    );
  }

  private createInventoryPieChart(): void {
    this.inventoryPieChart?.destroy();

    this.inventoryPieChart = undefined;

    const inventoryShares = this.getInventoryShares();

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: inventoryShares.map((item) => item.categoryName),
        datasets: [
          {
            label: '庫存商品占比',
            data: inventoryShares.map((item) => item.totalValue),
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
        resizeDelay: 200,
      },
    };

    this.inventoryPieChart = new Chart(
      this.inventoryPieChartRef.nativeElement,
      config,
    );
  }

  private calculatePurchaseSuggestionScore(product: Product): number {
    const dutyRate = product.dutyRate ?? 0;

    const vatRate = product.vatRate ?? 0;

    const unitPrice = product.unitPrice ?? 0;

    const taxRiskScore = dutyRate * 4 + vatRate * 2;

    const priceImpactScore =
      unitPrice >= 1000 ? 20 : unitPrice >= 500 ? 10 : 5;

    return Math.min(
      100,
      Math.round(taxRiskScore + priceImpactScore),
    );
  }

  private generateDateLabels(days: number): string[] {
    const labels: string[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();

      date.setDate(date.getDate() - i);

      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }

    return labels;
  }

  private generateTrendData(
    baseScore: number,
    days: number,
  ): number[] {
    const result: number[] = [];

    for (let i = 0; i < days; i++) {
      const wave = Math.sin(i / 2) * 6;

      const growth = i * 0.25;

      const value = baseScore + wave + growth;

      result.push(
        Math.max(
          0,
          Math.min(100, Math.round(value)),
        ),
      );
    }

    return result;
  }

  private getInventoryShares(): Array<{
    categoryName: string;
    totalValue: number;
  }> {
    const categoryMap = new Map<string, number>();

    this.products.forEach((product) => {
      const categoryName = product.categoryName || '未分類';

      const unitPrice = product.unitPrice ?? 0;

      categoryMap.set(
        categoryName,
        (categoryMap.get(categoryName) ?? 0) + unitPrice,
      );
    });

    return Array.from(categoryMap.entries()).map(
      ([categoryName, totalValue]) => {
        return {
          categoryName,
          totalValue,
        };
      },
    );
  }

  private destroyCharts(): void {
    this.purchaseTrendChart?.destroy();

    this.inventoryPieChart?.destroy();

    this.purchaseTrendChart = undefined;

    this.inventoryPieChart = undefined;
  }
}
