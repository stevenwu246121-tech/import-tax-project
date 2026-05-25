import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { HsCode } from '../../models/hs-code';

@Component({
  selector: 'app-product-manage',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './product-manage.component.html',

  styleUrls: ['./product-manage.component.scss'],
})
export class ProductManageComponent implements OnInit {
  products: Product[] = [];

  keyword = '';

  selectedCategory = '';

  categories: Category[] = [];

  hsCodes: HsCode[] = [];

  filteredHsCodes: HsCode[] = [];

  productReq = {
    name: '',
    categoryId: 1,
    hsCodeId: 1,
    originCountry: 'JP',
    unit: '箱',
    unitPrice: 0,
  };

  editingProductId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();

    this.loadCategories();

    this.loadHsCodes();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = response;
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  onCategoryChange(): void {
    const selectedCategory = this.categories.find(
      (category) => category.id === this.productReq.categoryId,
    );

    if (!selectedCategory) {
      this.filteredHsCodes = this.hsCodes;
      return;
    }

    this.filteredHsCodes = this.hsCodes.filter(
      (hsCode) => hsCode.categoryName === selectedCategory.name,
    );

    if (this.filteredHsCodes.length > 0) {
      this.productReq.hsCodeId = this.filteredHsCodes[0].id;
    } else {
      this.productReq.hsCodeId = 0;
    }
  }

  loadHsCodes(): void {
    this.apiService.getHsCodes().subscribe({
      next: (response) => {
        this.hsCodes = response;
        this.filteredHsCodes = response;
      },
      error: (error) => {
        console.error(error);
      },
    });
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

  isValidProduct(): boolean {
    if (!this.productReq.name.trim()) {
      alert('請輸入商品名稱');
      return false;
    }

    if (!this.productReq.hsCodeId) {
      alert('請選擇 HS Code');
      return false;
    }

    if (this.productReq.unitPrice <= 0) {
      alert('價格需大於 0');
      return false;
    }

    return true;
  }

  createProduct(): void {
    if (!this.isValidProduct()) {
      return;
    }

    this.apiService.createProduct(this.productReq).subscribe({
      next: () => {
        alert('新增成功');
        this.loadProducts();
        this.resetForm();
      },
      error: (error) => {
        console.error(error);
        alert('新增失敗');
      },
    });
  }

  deleteProduct(productId: number): void {
    const confirmed = confirm('確定要刪除嗎？');

    if (!confirmed) {
      return;
    }

    this.apiService.deleteProduct(productId).subscribe({
      next: () => {
        alert('刪除成功');

        this.loadProducts();
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;

    this.productReq = {
      name: product.productName,
      categoryId: 1,
      hsCodeId: 1,
      originCountry: 'JP',
      unit: '箱',
      unitPrice: product.unitPrice,
    };
  }

  submitProduct(): void {
    if (this.editingProductId) {
      this.apiService
        .updateProduct(this.editingProductId, this.productReq)
        .subscribe({
          next: () => {
            alert('更新成功');
            this.loadProducts();
            this.resetForm();
          },
          error: (error) => {
            console.error(error);
          },
        });

      return;
    }

    this.createProduct();
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

    this.editingProductId = null;
  }

  filteredProducts(): Product[] {
    return this.products.filter((product) => {
      const matchKeyword = product.productName.includes(this.keyword);

      const matchCategory =
        !this.selectedCategory ||
        product.categoryName === this.selectedCategory;

      return matchKeyword && matchCategory;
    });
  }
}
