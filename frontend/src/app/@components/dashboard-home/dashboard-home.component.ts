import { AfterViewInit } from '@angular/core';

import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
})
export class DashboardHomeComponent implements AfterViewInit {
  todayImportTotal = 125430;

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
    new Chart('countryChart', {
      type: 'doughnut',
      data: {
        labels: ['日本', '美國', '法國', '紐西蘭'],
        datasets: [
          {
            data: [45, 30, 15, 10],
            backgroundColor: ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6'],
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
  ngAfterViewInit(): void {
    this.createTrendChart();
    this.createCountryChart();
    this.createTaxChart();
  }
}
