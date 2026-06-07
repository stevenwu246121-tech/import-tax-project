export interface Product {
  unit?: string;

  id: number;

  productName: string;

  categoryName: string;

  hsCode: string;

  dutyRate: number;

  vatRate: number;

  unitPrice: number;

  stockQty: number;
}
