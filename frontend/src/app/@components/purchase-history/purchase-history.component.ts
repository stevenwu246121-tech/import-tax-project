import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatDialog } from '@angular/material/dialog';

import { ApiService } from '../../@services/api.service';

import { PurchaseOrder } from '../../models/purchase-order';

import { OrderDetailDialogComponent } from '../../shared/dialogs/order-detail-dialog/order-detail-dialog.component';

import { DialogService } from '../../@services/dialog.service';

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
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.apiService.getOrders().subscribe({
      next: (response: PurchaseOrder[]) => {
        this.orders = response;
      },
      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  openOrderDetail(orderId: number): void {
    this.apiService.getOrderDetail(orderId).subscribe({
      next: (order: PurchaseOrder) => {
        this.dialog.open(OrderDetailDialogComponent, {
          width: '760px',
          maxWidth: '95vw',
          data: order,
        });
      },
      error: (error: unknown) => {
        console.error(error);
      },
    });
  }

  deleteOrder(orderId: number): void {
    this.dialogService
      .confirm('確定要刪除此進貨紀錄嗎？')
      .subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.apiService.deleteOrder(orderId).subscribe({
          next: () => {
            this.dialogService.success('進貨紀錄已刪除');

            this.loadOrders();
          },
          error: (error: unknown) => {
            console.error(error);

            this.dialogService.error('刪除失敗');
          },
        });
      });
  }
}
