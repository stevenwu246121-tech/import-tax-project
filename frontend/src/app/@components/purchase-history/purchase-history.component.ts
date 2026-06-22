import { forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ApiService } from '../../@services/api.service';

import { DialogService } from '../../@services/dialog.service';

import { PurchaseOrder } from '../../models/purchase-order';

import { OrderDetailDialogComponent } from '../../shared/dialogs/order-detail-dialog/order-detail-dialog.component';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.scss',
})
export class PurchaseHistoryComponent implements OnInit {
  orders: PurchaseOrder[] = [];

  recordKeyword = '';

  selectedOriginCountry = '';

  startDate = '';

  endDate = '';

  dateErrorMessage = '';

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
        this.orders = (response ?? []).sort((a, b) => {
          const timeA = new Date(a.createdAt ?? '').getTime();

          const timeB = new Date(b.createdAt ?? '').getTime();

          return timeB - timeA;
        });

        console.log('進貨紀錄資料：', this.orders);
      },
      error: (error: unknown) => {
        console.error(error);

        this.dialogService.error('進貨紀錄載入失敗');
      },
    });
  }

  get filteredOrderList(): PurchaseOrder[] {
    const keyword = this.recordKeyword.trim().toLowerCase();

    return this.orders.filter((order) => {
      const orderNo = order.orderNo?.toLowerCase() ?? '';

      const supplierName = order.supplierName?.toLowerCase() ?? '';

      const originCountry = order.originCountry ?? '';

      const orderDate = this.toDateString(order.createdAt);

      const matchKeyword =
        !keyword || orderNo.includes(keyword) || supplierName.includes(keyword);

      const matchCountry =
        !this.selectedOriginCountry ||
        originCountry === this.selectedOriginCountry;

      const matchStartDate = !this.startDate || orderDate >= this.startDate;

      const matchEndDate = !this.endDate || orderDate <= this.endDate;

      return matchKeyword && matchCountry && matchStartDate && matchEndDate;
    });
  }

  get filteredOrderCount(): number {
    return this.filteredOrderList.length;
  }

  get filteredSubtotalTotal(): number {
    return this.filteredOrderList.reduce(
      (sum, order) => sum + (order.subtotal ?? 0),
      0,
    );
  }

  get filteredDutyTotal(): number {
    return this.filteredOrderList.reduce(
      (sum, order) => sum + (order.dutyTotal ?? 0),
      0,
    );
  }

  get filteredVatTotal(): number {
    return this.filteredOrderList.reduce(
      (sum, order) => sum + (order.vatTotal ?? 0),
      0,
    );
  }

  get filteredLandedCostTotal(): number {
    return this.filteredOrderList.reduce(
      (sum, order) => sum + (order.landedCostTotal ?? 0),
      0,
    );
  }

  openOrderDetail(orderId: number): void {
    this.apiService.getOrderDetail(orderId).subscribe({
      next: (order: PurchaseOrder) => {
        console.log('進貨明細資料：', order);

        this.dialog.open(OrderDetailDialogComponent, {
          width: '760px',
          maxWidth: '95vw',
          data: order,
        });
      },
      error: (error: unknown) => {
        console.error(error);

        this.dialogService.error('進貨明細載入失敗');
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

  onDateChange(): void {
    this.dateErrorMessage = '';

    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.dateErrorMessage = '結束日不得早於起始日';

      this.endDate = '';
    }
  }

  clearFilters(): void {
    this.recordKeyword = '';

    this.selectedOriginCountry = '';

    this.startDate = '';

    this.endDate = '';

    this.dateErrorMessage = '';
  }

  getCountryLabel(originCountry?: string): string {
    if (originCountry === 'JP') {
      return 'JP 日本';
    }

    if (originCountry === 'TW') {
      return 'TW 台灣';
    }

    return originCountry || '-';
  }

  getStatusLabel(status?: string): string {
    if (!status) {
      return '已完成';
    }

    if (status === 'CONFIRMED') {
      return '已完成';
    }

    if (status === 'COMPLETED') {
      return '已完成';
    }

    if (status === 'PENDING') {
      return '處理中';
    }

    if (status === 'CANCELLED') {
      return '已取消';
    }

    return status;
  }

  getStatusClass(status?: string): string {
    if (!status || status === 'CONFIRMED' || status === 'COMPLETED') {
      return 'status-completed';
    }

    if (status === 'PENDING') {
      return 'status-pending';
    }

    if (status === 'CANCELLED') {
      return 'status-cancelled';
    }

    return 'status-default';
  }

  exportFilteredOrdersCsv(): void {
    const orders = this.filteredOrderList;

    if (orders.length === 0) {
      this.dialogService.warning('目前沒有可匯出的進貨紀錄');

      return;
    }

    const detailRequests = orders.map((order) =>
      this.apiService.getOrderDetail(order.id),
    );

    forkJoin(detailRequests).subscribe({
      next: (orderDetails: PurchaseOrder[]) => {
        this.exportOrderDetailsCsv(orderDetails);
      },
      error: (error: unknown) => {
        console.error(error);

        this.dialogService.error('進貨明細匯出失敗');
      },
    });
  }

  private exportOrderDetailsCsv(orders: PurchaseOrder[]): void {
    const headers = [
      '訂單編號',
      '建立時間',
      '來源國',
      '狀態',
      '商品名稱',
      'HS Code',
      '數量',
      '單價',
      '商品小計',
      '進口稅率',
      '進口稅金額',
      '營業稅率',
      '營業稅金額',
      '到岸成本',
      '訂單商品總額',
      '訂單進口稅',
      '訂單營業稅',
      '訂單到岸成本',
    ];

    const rows = orders.flatMap((order) => {
      const items = order.items ?? [];

      if (items.length === 0) {
        return [
          [
            order.orderNo,
            this.formatDateTimeForCsv(order.createdAt),
            this.getCountryLabel(order.originCountry),
            this.getStatusLabel(order.status),
            '-',
            '-',
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            order.subtotal ?? 0,
            order.dutyTotal ?? 0,
            order.vatTotal ?? 0,
            order.landedCostTotal ?? 0,
          ],
        ];
      }

      return items.map((item) => [
        order.orderNo,
        this.formatDateTimeForCsv(order.createdAt),
        this.getCountryLabel(order.originCountry),
        this.getStatusLabel(order.status),
        item.productName ?? '-',
        item.hsCode ?? '-',
        item.quantity ?? 0,
        item.unitPrice ?? 0,
        item.subtotal ?? 0,
        item.dutyRate ?? 0,
        item.dutyAmount ?? 0,
        item.vatRate ?? 0,
        item.vatAmount ?? 0,
        item.landedCost ?? 0,
        order.subtotal ?? 0,
        order.dutyTotal ?? 0,
        order.vatTotal ?? 0,
        order.landedCostTotal ?? 0,
      ]);
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => this.escapeCsvValue(value)).join(','))
      .join('\n');

    const bom = '\uFEFF';

    const blob = new Blob([bom + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');

    const today = new Date().toISOString().substring(0, 10);

    link.href = url;

    link.download = `purchase-history-details-${today}.csv`;

    link.click();

    window.URL.revokeObjectURL(url);

    this.dialogService.success('進貨明細 CSV 已匯出');
  }

  private escapeCsvValue(value: unknown): string {
    const text = String(value ?? '');

    const escapedText = text.replace(/"/g, '""');

    return `"${escapedText}"`;
  }

  private formatDateTimeForCsv(dateTime?: string): string {
    if (!dateTime) {
      return '-';
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return `\t${dateTime}`;
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    const hour = String(date.getHours()).padStart(2, '0');

    const minute = String(date.getMinutes()).padStart(2, '0');

    return `\t${year}/${month}/${day} ${hour}:${minute}`;
  }

  private toDateString(dateTime?: string): string {
    if (!dateTime) {
      return '';
    }

    if (dateTime.includes('T')) {
      return dateTime.split('T')[0];
    }

    return dateTime.substring(0, 10);
  }
}
