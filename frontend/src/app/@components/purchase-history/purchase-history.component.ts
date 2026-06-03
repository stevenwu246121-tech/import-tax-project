import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../@services/api.service';

import { PurchaseOrder } from '../../models/purchase-order';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.scss'
})
export class PurchaseHistoryComponent implements OnInit {
  orders: PurchaseOrder[] = [];

  constructor(private apiService: ApiService) {}

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
