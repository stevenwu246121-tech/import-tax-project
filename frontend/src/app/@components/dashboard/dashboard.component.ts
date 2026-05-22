import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Chart, registerables } from 'chart.js';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('dutyChart')
  dutyChartRef!: ElementRef;

  @ViewChild('categoryChart')
  categoryChartRef!: ElementRef;

  products: Product[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response) => {
        this.products = response;

        console.log(this.products);

        this.createDutyChart();

        this.createCategoryChart();
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  createDutyChart(): void {
    const labels = this.products.map((p) => p.productName);

    const dutyRates = this.products.map((p) => p.dutyRate);

    new Chart(this.dutyChartRef.nativeElement, {
      type: 'bar',

      data: {
        labels: labels,

        datasets: [
          {
            label: 'Import Duty %',

            data: dutyRates,
          },
        ],
      },

      options: {
        responsive: true,

        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  }

  createCategoryChart(): void {
    const categoryMap = new Map<string, number[]>();

    this.products.forEach((product) => {
      if (!categoryMap.has(product.categoryName)) {
        categoryMap.set(product.categoryName, []);
      }

      categoryMap.get(product.categoryName)?.push(product.dutyRate);
    });

    const labels = Array.from(categoryMap.keys());

    const averages = labels.map((label) => {
      const rates = categoryMap.get(label) || [];

      const total = rates.reduce((sum, rate) => sum + rate, 0);

      return total / rates.length;
    });

    new Chart(this.categoryChartRef.nativeElement, {
      type: 'pie',

      data: {
        labels: labels,

        datasets: [
          {
            label: '分類平均 Duty %',

            data: averages,
          },
        ],
      },

      options: {
        responsive: true,
      },
    });
  }
}
