import { PurchaseItemResponse }
from './purchase-item-response';

export interface PurchaseCalculateResponse {

  items: PurchaseItemResponse[];

  subtotal: number;

  dutyTotal: number;

  vatTotal: number;

  landedCostTotal: number;
}
