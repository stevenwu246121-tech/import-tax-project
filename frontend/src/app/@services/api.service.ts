import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Product } from '../models/product';

import { PurchaseCalculateResponse } from '../models/purchase-calculate-response';

import { PurchaseCalculateRequest } from '../models/purchase-calculate-request';

import { HsCode } from '../models/hs-code';

import { Category } from '../models/category';
import { PurchaseOrder } from '../models/purchase-order';
import { DashboardSummary } from '../models/dashboard-summary';
import { DashboardTrend } from '../models/dashboard-trend';
import { LowStock } from '../models/low-stock';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  createProduct(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/products`, body);
  }

  updateProduct(productId: number, body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${productId}`, body);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${productId}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  getHsCodes(): Observable<HsCode[]> {
    return this.http.get<HsCode[]>(`${this.baseUrl}/hs-codes`);
  }

  createHsCode(body: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/hs-codes`, body);
  }

  updateHsCode(hsCodeId: number, body: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/hs-codes/${hsCodeId}`, body);
  }

  deleteHsCode(hsCodeId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/hs-codes/${hsCodeId}`);
  }

  getJpyExchangeRate(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/exchange-rate/jpy`);
  }

  calculatePurchase(
    request: PurchaseCalculateRequest,
  ): Observable<PurchaseCalculateResponse> {
    return this.http.post<PurchaseCalculateResponse>(
      `${this.baseUrl}/purchase/calculate`,
      request,
    );
  }

  createOrder(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, request);
  }

  getOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.baseUrl}/orders`);
  }

  deleteOrder(orderId: number) {
    return this.http.delete(`${this.baseUrl}/orders/${orderId}`);
  }
  getOrderDetail(orderId: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/orders/${orderId}`);
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  getDashboardTrend(days: number): Observable<DashboardTrend[]> {
    return this.http.get<DashboardTrend[]>(
      `${this.baseUrl}/dashboard/trend?days=${days}`,
    );
  }

  getLowStockProducts() {
    return this.http.get<LowStock[]>(`${this.baseUrl}/dashboard/low-stock`);
  }
}
