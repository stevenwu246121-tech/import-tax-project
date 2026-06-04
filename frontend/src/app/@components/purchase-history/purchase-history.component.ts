import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';

import { ApiService } from '../../@services/api.service';

import { PurchaseOrder } from '../../models/purchase-order';

import { OrderDetailDialogComponent } from '../../shared/dialogs/order-detail-dialog/order-detail-dialog.component';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.scss',
})
export class PurchaseHistoryComponent implements OnInit {
  orders: PurchaseOrder[] = [];

  constructor(
    private dialog: MatDialog,
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

  openOrderDetail(orderId: number): void {
    this.apiService.getOrderDetail(orderId).subscribe({
      next: (order) => {
        this.dialog.open(OrderDetailDialogComponent, {
          width: '760px',
          maxWidth: '95vw',
          data: order,
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
