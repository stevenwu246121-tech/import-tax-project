import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product';
import { PurchaseCalculateResponse } from '../models/purchase-calculate-response';
import { PurchaseCalculateRequest } from '../models/purchase-calculate-request';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getJpyExchangeRate(): Observable<number> {
  return this.http.get<number>(
    `${this.baseUrl}/exchange-rate/jpy`
  );
}

  calculatePurchase(
    request: PurchaseCalculateRequest,
  ): Observable<PurchaseCalculateResponse> {
    return this.http.post<PurchaseCalculateResponse>(
      `${this.baseUrl}/purchase/calculate`,
      request,
    );
  }
}
