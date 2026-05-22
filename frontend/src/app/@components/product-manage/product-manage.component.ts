import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-manage',

  standalone: true,

  imports: [CommonModule, FormsModule, RouterLink],

  templateUrl: './product-manage.component.html',

  styleUrls: ['./product-manage.component.scss'],
})
export class ProductManageComponent implements OnInit {
  products: Product[] = [];

  productReq = {
    name: '',
    categoryId: 1,
    hsCodeId: 1,
    originCountry: 'JP',
    unit: '箱',
    unitPrice: 0,
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response) => {
        this.products = response;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  createProduct(): void {
    this.apiService.createProduct(this.productReq).subscribe({
      next: () => {
        alert('新增成功');

        this.loadProducts();

        this.resetForm();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  resetForm(): void {
    this.productReq = {
      name: '',
      categoryId: 1,
      hsCodeId: 1,
      originCountry: 'JP',
      unit: '箱',
      unitPrice: 0,
    };
  }

  deleteProduct(productId: number): void {

  const confirmed =
    confirm('確定要刪除嗎？');

  if (!confirmed) {
    return;
  }

  this.apiService
    .deleteProduct(productId)
    .subscribe({

      next: () => {

        alert('刪除成功');

        this.loadProducts();
      },

      error: (error) => {

        console.error(error);
      }
    });
}
}
