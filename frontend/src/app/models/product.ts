export interface Product {
  id: number;
  productName: string;
  categoryId?: number;
  categoryName: string;
  hsCodeId?: number;
  hsCode: string;
  originCountry: string;
  unit: string;
  unitPrice: number;
  stockQty: number;
  dutyRate?: number;
  vatRate?: number;
}
