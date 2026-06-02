import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';
import { DialogService } from '../../@services/dialog.service';

import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { HsCode } from '../../models/hs-code';

interface ProductReq {
  name: string;
  categoryId: number;
  hsCodeId: number;
  originCountry: string;
  unit: string;
  unitPrice: number | null;
}

@Component({
  selector: 'app-product-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-manage.component.html',
  styleUrls: ['./product-manage.component.scss'],
})
export class ProductManageComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  hsCodes: HsCode[] = [];
  filteredHsCodes: HsCode[] = [];

  keyword = '';
  selectedCategory = '';

  productReq: ProductReq = {
    name: '',
    categoryId: 0,
    hsCodeId: 0,
    originCountry: '',
    unit: '',
    unitPrice: null,
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

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    this.loadHsCodes();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response;
      },
      error: (error: unknown) => {
        console.error(error);
        this.dialogService.error('商品資料載入失敗');
      },
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categories = response;
      },
      error: (error: unknown) => {
        console.error(error);
        this.dialogService.error('分類資料載入失敗');
      },
    });
  }

  loadHsCodes(): void {
    this.apiService.getHsCodes().subscribe({
      next: (response: HsCode[]) => {
        this.hsCodes = response;
        this.filteredHsCodes = response;
      },
      error: (error: unknown) => {
        console.error(error);
        this.dialogService.error('HS Code 資料載入失敗');
      },
    });
  }

  toggleActionMenu(id: number): void {
    this.openedActionId = this.openedActionId === id ? null : id;
  }

  onCategoryChange(): void {
    const selectedCategory = this.categories.find(
      (category) => category.id === this.productReq.categoryId,
    );

    if (!selectedCategory) {
      this.filteredHsCodes = this.hsCodes;
      this.productReq.hsCodeId = 0;
      return;
    }

    this.filteredHsCodes = this.hsCodes.filter(
      (hsCode) => hsCode.categoryName === selectedCategory.name,
    );

    this.productReq.hsCodeId =
      this.filteredHsCodes.length > 0 ? this.filteredHsCodes[0].id : 0;
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
      this.dialogService.warning(
        `${this.productReq.name} 的分類只能是「${rule.category}」`,
      );
      return false;
    }

    if (selectedHsCode?.code !== rule.hsCode) {
      this.dialogService.warning(
        `${this.productReq.name} 的 HS Code 只能是「${rule.hsCode}」`,
      );
      return false;
    }

    return true;
  }

  submitProduct(): void {
    if (!this.productReq.name.trim()) {
      this.dialogService.warning('請輸入商品名稱');
      return;
    }

    if (!this.productReq.categoryId) {
      this.dialogService.warning('請選擇分類');
      return;
    }

    if (!this.productReq.hsCodeId) {
      this.dialogService.warning('請選擇 HS Code');
      return;
    }

    if (!this.productReq.originCountry) {
      this.dialogService.warning('請選擇來源國');
      return;
    }

    if (!this.productReq.unit.trim()) {
      this.dialogService.warning('請輸入單位');
      return;
    }

    if (!this.productReq.unitPrice || this.productReq.unitPrice <= 0) {
      this.dialogService.warning('價格必須大於 0');
      return;
    }

    const duplicateProduct = this.products.some(
      (product) =>
        product.productName.trim() === this.productReq.name.trim() &&
        product.id !== this.editingProductId,
    );

    if (duplicateProduct) {
      this.dialogService.warning('商品名稱已存在，請勿重複新增');
      return;
    }

    if (
      this.productReq.name.includes('日本') &&
      this.productReq.originCountry !== 'JP'
    ) {
      this.dialogService.warning('商品名稱包含「日本」，來源國只能選 JP');
      return;
    }

    if (
      this.productReq.name.includes('台灣') &&
      this.productReq.originCountry !== 'TW'
    ) {
      this.dialogService.warning('商品名稱包含「台灣」，來源國只能選 TW');
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
            this.dialogService.success('更新成功').subscribe(() => {
              this.loadProducts();
              this.resetForm();
            });
          },
          error: (error: unknown) => {
            console.error(error);
            this.dialogService.error('更新失敗');
          },
        });

      return;
    }

    this.createProduct();
  }

  createProduct(): void {
    this.apiService.createProduct(this.productReq).subscribe({
      next: () => {
        this.dialogService.success('新增成功').subscribe(() => {
          this.loadProducts();
          this.resetForm();
        });
      },
      error: (error: unknown) => {
        console.error(error);
        this.dialogService.error('新增失敗');
      },
    });
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;

    const matchedCategory = this.categories.find(
      (category) => category.name === product.categoryName,
    );

    const matchedHsCode = this.hsCodes.find(
      (hsCode) => hsCode.code === product.hsCode,
    );

    this.productReq = {
      name: product.productName,
      categoryId: matchedCategory?.id ?? 0,
      hsCodeId: matchedHsCode?.id ?? 0,
      originCountry: product.productName.includes('台灣') ? 'TW' : 'JP',
      unit: '箱',
      unitPrice: product.unitPrice,
    };

    this.onCategoryChange();

    if (matchedHsCode) {
      this.productReq.hsCodeId = matchedHsCode.id;
    }
  }

  deleteProduct(productId: number): void {
    this.dialogService
      .confirm('確定要刪除此商品嗎？')
      .subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.apiService.deleteProduct(productId).subscribe({
          next: () => {
            this.dialogService.success('商品刪除成功').subscribe(() => {
              this.loadProducts();
            });
          },
          error: (error: unknown) => {
            console.error(error);
            this.dialogService.error('商品刪除失敗');
          },
        });
      });
  }

  resetForm(): void {
    this.productReq = {
      name: '',
      categoryId: 0,
      hsCodeId: 0,
      originCountry: '',
      unit: '',
      unitPrice: null,
    };

    this.filteredHsCodes = this.hsCodes;
    this.editingProductId = null;
    this.openedActionId = null;
  }

  filteredProducts(): Product[] {
    return this.products.filter((product) => {
      const matchKeyword = product.productName
        .toLowerCase()
        .includes(this.keyword.trim().toLowerCase());

      const matchCategory =
        !this.selectedCategory ||
        product.categoryName === this.selectedCategory;

      return matchKeyword && matchCategory;
    });
  }
}
