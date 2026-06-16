import { PurchaseOrderItem } from './purchase-order-item';

export interface PurchaseOrder {
  id: number;

  orderNo: string;

  supplierName?: string;

  importCountry?: string;

  originCountry?: string;

  currencyCode?: string;

  exchangeRate?: number;

  subtotal: number;

  dutyTotal: number;

  vatTotal: number;

  landedCostTotal: number;

  status?: string;

  createdAt: string;

  items?: PurchaseOrderItem[];
}
