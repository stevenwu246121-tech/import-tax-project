export interface PurchaseOrderItem {

  productId: number;

  productName: string;

  hsCode: string;

  quantity: number;

  unitPrice: number;

  subtotal: number;

  dutyRate: number;

  dutyAmount: number;

  vatRate: number;

  vatAmount: number;

  landedCost: number;
}
