import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ApiService } from '../../@services/api.service';

import { PurchaseOrder } from '../../models/purchase-order';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
})
export class OrderHistoryComponent implements OnInit {

  orders: PurchaseOrder[] = [];

  constructor(
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.apiService.getOrders().subscribe({
      next: (response) => {
        this.orders = response;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
