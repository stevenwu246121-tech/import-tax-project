export interface PurchaseItemResponse {

  productName: string;

  quantity: number;

  unitPrice: number;

  subtotal: number;

  dutyRate: number;

  dutyAmount: number;

  vatRate: number;

  vatAmount: number;

  landedCost: number;
}
