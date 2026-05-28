import { AfterViewInit, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Chart, registerables } from 'chart.js';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  todayImportTotal = 0;

  totalDuty = 0;

  totalVat = 0;

  products: Product[] = [];

  previewProducts: Product[] = [];

  countryTotals: { [key: string]: number } = {};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.createTrendChart();
    this.createTaxChart();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response;

        this.previewProducts = response.slice(0, 3);

        this.todayImportTotal = response.reduce(
          (sum, product) => sum + product.unitPrice,
          0,
        );

        this.totalDuty = response.reduce(
          (sum, product) => sum + (product.unitPrice * product.dutyRate) / 100,
          0,
        );

        this.totalVat = response.reduce(
          (sum, product) => sum + (product.unitPrice * product.vatRate) / 100,
          0,
        );

        this.countryTotals = response.reduce(
          (acc: { [key: string]: number }, product: Product) => {
            const country = product.categoryName || 'Unknown';

            if (!acc[country]) {
              acc[country] = 0;
            }

            acc[country] += product.unitPrice;

            return acc;
          },
          {},
        );

        this.createCountryChart();
      },

      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  createTrendChart(): void {
    new Chart('trendChart', {
      type: 'line',
      data: {
        labels: ['05/14', '05/15', '05/16', '05/17', '05/18', '05/19', '05/20'],
        datasets: [
          {
            label: '進貨成本',
            data: [65000, 88000, 76000, 110000, 125000, 118000, 130000],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.12)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
    });
  }

  createCountryChart(): void {
    const labels = Object.keys(this.countryTotals);

    const data = Object.values(this.countryTotals);

    new Chart('countryChart', {
      type: 'doughnut',

      data: {
        labels,

        datasets: [
          {
            data,

            backgroundColor: [
              '#2563eb',
              '#22c55e',
              '#f59e0b',
              '#8b5cf6',
              '#ec4899',
            ],
          },
        ],
      },
    });
  }
  createTaxChart(): void {
    new Chart('taxChart', {
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
}
