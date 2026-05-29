import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';

import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { HsCode } from '../../models/hs-code';
import { ExchangeRateService } from '../../@services/exchange-rate.service';

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

  productRules = {
    日本咖啡豆: {
      category: '乾貨',
      hsCode: '0901.11.0000',
    },

    日本白米: {
      category: '乾貨',
      hsCode: '1006.30.0000',
    },

    日本和牛: {
      category: '肉品',
      hsCode: '0201.30.0000',
    },
  };

  editingProductId: number | null = null;

  openedActionId: number | null = null;

  toggleActionMenu(id: number): void {
    this.openedActionId = this.openedActionId === id ? null : id;
  }

  constructor(
    private apiService: ApiService,
    private exchangeRateService: ExchangeRateService,
  ) {}

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

  isValidProductRule(): boolean {
    const rule =
      this.productRules[this.productReq.name as keyof typeof this.productRules];

    if (!rule) {
      return true;
    }

    const selectedCategory = this.categories.find(
      (category) => category.id === this.productReq.categoryId,
    );

    const selectedHsCode = this.hsCodes.find(
      (hsCode) => hsCode.id === this.productReq.hsCodeId,
    );

    if (selectedCategory?.name !== rule.category) {
      alert(`${this.productReq.name} 的分類只能是「${rule.category}」`);
      return false;
    }

    if (selectedHsCode?.code !== rule.hsCode) {
      alert(`${this.productReq.name} 的 HS Code 只能是「${rule.hsCode}」`);
      return false;
    }

    return true;
  }

  createProduct(): void {
    if (!this.isValidProductRule()) {
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
    if (!this.productReq.name.trim()) {
      alert('請輸入商品名稱');
      return;
    }

    if (!this.productReq.originCountry) {
      alert('請選擇來源國');
      return;
    }

    if (!this.productReq.unit.trim()) {
      alert('請輸入單位');
      return;
    }

    const duplicateProduct = this.products.some(
      (product) =>
        product.productName.trim() === this.productReq.name.trim() &&
        product.id !== this.editingProductId,
    );

    if (duplicateProduct) {
      alert('商品名稱已存在，請勿重複新增');
      return;
    }

    if (!this.productReq.unitPrice || this.productReq.unitPrice <= 0) {
      alert('單價不可小於 0');
      return;
    }

    if (
      this.productReq.name.includes('日本') &&
      this.productReq.originCountry !== 'JP'
    ) {
      alert('商品名稱包含「日本」，來源國只能選 JP');
      return;
    }

    if (
      this.productReq.name.includes('台灣') &&
      this.productReq.originCountry !== 'TW'
    ) {
      alert('商品名稱包含「台灣」，來源國只能選 TW');
      return;
    }

    if (!this.isValidProductRule()) {
      return;
    }

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

            alert('更新失敗');
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

  onProductNameChange(): void {
    const rule =
      this.productRules[this.productReq.name as keyof typeof this.productRules];

    if (!rule) {
      return;
    }

    const category = this.categories.find(
      (item) => item.name === rule.category,
    );

    const hsCode = this.hsCodes.find((item) => item.code === rule.hsCode);

    if (category) {
      this.productReq.categoryId = category.id;
    }

    this.onCategoryChange();

    if (hsCode) {
      this.productReq.hsCodeId = hsCode.id;
    }
  }
}
