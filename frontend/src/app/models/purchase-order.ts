export interface PurchaseOrder {
  id: number;

  orderNo: string;

  supplierName: string;

  subtotal: number;

  dutyTotal: number;

  vatTotal: number;

  landedCostTotal: number;

  createdAt: string;
}
