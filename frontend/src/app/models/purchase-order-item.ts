export interface PurchaseOrderItem {
  id?: number;

  productId: number;

  productName: string;

  hsCode?: string;

  hsCodeName?: string;

  quantity: number;

  unitPrice: number;

  subtotal: number;

  dutyRate?: number;

  dutyAmount: number;

  vatRate?: number;

  vatAmount: number;

  landedCost: number;
}
