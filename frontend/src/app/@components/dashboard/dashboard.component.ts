import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { ApiService } from '../../@services/api.service';
import { Product } from '../../models/product';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dutyChart')
  dutyChartRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('categoryChart')
  categoryChartRef!: ElementRef<HTMLCanvasElement>;

  products: Product[] = [];

  isLoading = false;
  errorMessage = '';

  private viewReady = false;
  private dutyChart?: Chart;
  private categoryChart?: Chart;

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
        this.isLoading = false;
        this.renderCharts();
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

private renderCharts(): void {
  if (
    !this.viewReady ||
    this.products.length === 0 ||
    !this.dutyChartRef ||
    !this.categoryChartRef
  ) {
    return;
  }

  this.createDutyChart();
  this.createCategoryChart();
}

  private createDutyChart(): void {
  this.dutyChart?.destroy();
  this.dutyChart = undefined;

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: this.products.map((product) => product.productName),
      datasets: [
        {
          label: 'Import Duty %',
          data: this.products.map((product) => product.dutyRate ?? 0),
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
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}%`,
          },
        },
      },
    },
  };

  this.dutyChart = new Chart(this.dutyChartRef.nativeElement, config);
}
private createCategoryChart(): void {
  this.categoryChart?.destroy();
  this.categoryChart = undefined;

  const categoryAverages = this.getCategoryDutyAverages();

  const config: ChartConfiguration<'pie'> = {
    type: 'pie',
    data: {
      labels: categoryAverages.map((item) => item.categoryName),
      datasets: [
        {
          label: '分類平均 Duty %',
          data: categoryAverages.map((item) => item.averageDutyRate),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 200,
    },
  };

  this.categoryChart = new Chart(
    this.categoryChartRef.nativeElement,
    config
  );
}

  private getCategoryDutyAverages(): Array<{
    categoryName: string;
    averageDutyRate: number;
  }> {
    const categoryMap = new Map<string, number[]>();

    this.products.forEach((product) => {
      const categoryName = product.categoryName || '未分類';
      const dutyRate = product.dutyRate ?? 0;

      const rates = categoryMap.get(categoryName) ?? [];
      rates.push(dutyRate);
      categoryMap.set(categoryName, rates);
    });

    return Array.from(categoryMap.entries()).map(([categoryName, rates]) => {
      const total = rates.reduce((sum, rate) => sum + rate, 0);

      return {
        categoryName,
        averageDutyRate: rates.length > 0 ? total / rates.length : 0,
      };
    });
  }

  private destroyCharts(): void {
    this.dutyChart?.destroy();
    this.categoryChart?.destroy();

    this.dutyChart = undefined;
    this.categoryChart = undefined;
  }
}
