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
  categoryId: number | null;
  hsCodeId: number | null;
  originCountry: string;
  unit: string;
  unitPrice: number | null;
  stockQty: number | null;
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

  hsCodeSearchKeyword = '';

  keyword = '';

  selectedCategory = '';

  recommendMessage = '';

  isAutoRecommendEnabled = true;

  productReq: ProductReq = {
    name: '',
    categoryId: null,
    hsCodeId: null,
    originCountry: '',
    unit: '',
    unitPrice: null,
    stockQty: null,
  };

  productRules = {
    咖啡: {
      category: '乾貨',
      hsCode: '0901.11.0000',
    },
    咖啡豆: {
      category: '乾貨',
      hsCode: '0901.11.0000',
    },
    白米: {
      category: '乾貨',
      hsCode: '1006.30.0000',
    },
    米: {
      category: '乾貨',
      hsCode: '1006.30.0000',
    },
    拉麵: {
      category: '乾貨',
      hsCode: '1902.30.0000',
    },
    即食麵: {
      category: '乾貨',
      hsCode: '1902.30.0000',
    },
    抹茶: {
      category: '乾貨',
      hsCode: '0902.10.0000',
    },
    抹茶粉: {
      category: '乾貨',
      hsCode: '0902.10.0000',
    },
    和牛: {
      category: '肉品',
      hsCode: '0201.30.0000',
    },
    牛肉: {
      category: '肉品',
      hsCode: '0201.30.0000',
    },
    鮭魚: {
      category: '海鮮',
      hsCode: '0302.14.0000',
    },
    冷凍蝦: {
      category: '冷凍',
      hsCode: '0306.17.0000',
    },
    蝦: {
      category: '冷凍',
      hsCode: '0306.17.0000',
    },
    番茄: {
      category: '生鮮',
      hsCode: '0702.00.0000',
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

        this.filteredHsCodes = this.hsCodes.slice(0, 50);
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
      this.filteredHsCodes = this.hsCodes.slice(0, 50);
      this.productReq.hsCodeId = null;
      return;
    }

    this.filteredHsCodes = this.hsCodes
      .filter((hsCode) => hsCode.categoryName === selectedCategory.name)
      .slice(0, 50);

    this.productReq.hsCodeId =
      this.filteredHsCodes.length > 0 ? this.filteredHsCodes[0].id : null;
  }

  onProductNameChange(): void {
    if (!this.isAutoRecommendEnabled) {
      return;
    }

    const productName = this.productReq.name.trim();

    if (!productName) {
      this.recommendMessage = '';
      return;
    }

    this.apiService.recommendHsCode(productName).subscribe({
      next: (hsCode) => {
        if (!hsCode) {
          this.recommendMessage = '';
          return;
        }

        const category = this.categories.find(
          (item) => item.name === hsCode.categoryName,
        );

        if (category) {
          this.productReq.categoryId = category.id;
        }

        this.onCategoryChange();

        this.productReq.hsCodeId = hsCode.id;

        this.recommendMessage = `系統推薦：${hsCode.categoryName} / ${hsCode.code} / 進口稅 ${hsCode.dutyRate}% / 營業稅 ${hsCode.vatRate}%`;
      },

      error: (error) => {
        console.error(error);
        this.recommendMessage = '';
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

    if (!this.productReq.unit) {
      this.dialogService.warning('請選擇數量單位');
      return;
    }

    if (!this.productReq.unitPrice || this.productReq.unitPrice <= 0) {
      this.dialogService.warning('價格必須大於 0');

      return;
    }

    if (this.productReq.stockQty === null) {
      this.dialogService.warning('請輸入庫存數量');
      return;
    }

    if (this.productReq.stockQty < 0) {
      this.dialogService.warning('庫存數量不可小於 0');
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

    this.productReq = {
      name: product.productName,
      categoryId: product.categoryId ?? null,
      hsCodeId: product.hsCodeId ?? null,
      originCountry: product.originCountry ?? '',
      unit: product.unit ?? '',
      unitPrice: product.unitPrice ?? null,
      stockQty: product.stockQty ?? null,
    };

    this.recommendMessage = '';
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
      categoryId: null,
      hsCodeId: null,
      originCountry: '',
      unit: '',
      unitPrice: null,
      stockQty: null,
    };

    this.filteredHsCodes = this.hsCodes.slice(0, 50);
    this.hsCodeSearchKeyword = '';
    this.editingProductId = null;
    this.openedActionId = null;
    this.recommendMessage = '';
    this.isAutoRecommendEnabled = true;
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

  onManualHsCodeChange(): void {
    this.isAutoRecommendEnabled = false;

    this.recommendMessage = '';

    this.onHsCodeChange();
  }

  onManualCategoryChange(): void {
    this.isAutoRecommendEnabled = false;

    this.recommendMessage = '';

    this.onCategoryChange();
  }

  recommendHsCode(): void {
    const productName = this.productReq.name?.trim();

    if (!productName) {
      this.dialogService.warning('請先輸入商品名稱');
      return;
    }

    // 先清掉舊推薦結果，避免殘留上一筆資料
    this.productReq.categoryId = null;
    this.productReq.hsCodeId = null;
    this.recommendMessage = '';

    this.apiService.recommendHsCode(productName).subscribe({
      next: (res: HsCode) => {
        console.log('推薦結果', res);

        if (!res || !res.code) {
          this.recommendMessage = '找不到對應的 HS Code';
          this.dialogService.warning('找不到對應的 HS Code');
          return;
        }

        // 優先用前端完整 hsCodes 清單裡的資料
        const matchedHsCode =
          this.hsCodes.find((hs) => hs.code === res.code) ?? res;

        this.productReq.hsCodeId = matchedHsCode.id;

        // 關鍵：把推薦到的 HS Code 放進目前下拉選單
        this.putRecommendedHsCodeIntoOptions(matchedHsCode);

        // 關鍵：用 categoryId 或 categoryName 自動帶入分類
        this.setCategoryByHsCode(matchedHsCode);

        this.hsCodeSearchKeyword = matchedHsCode.name;

        this.recommendMessage = `已推薦 HS Code：${matchedHsCode.code} - ${matchedHsCode.name}`;

        this.dialogService.success(this.recommendMessage);
      },
      error: (err) => {
        console.error(err);

        this.productReq.categoryId = null;
        this.productReq.hsCodeId = null;

        this.recommendMessage = '找不到對應的 HS Code';
        this.dialogService.warning('找不到對應的 HS Code');
      },
    });
  }

  getUnitLabel(unit?: string): string {
    switch (unit) {
      case 'kg':
        return '公斤 kg';
      case 'g':
        return '公克 g';
      default:
        return '-';
    }
  }

  formatHsCodeOption(hs: HsCode): string {
    const text = `${hs.code} - ${hs.name}`;

    return text.length > 28 ? text.slice(0, 28) + '...' : text;
  }

  onHsCodeChange(): void {
    const selectedHsCode = this.hsCodes.find(
      (hs) => hs.id === this.productReq.hsCodeId,
    );

    if (!selectedHsCode) {
      return;
    }

    this.setCategoryByHsCode(selectedHsCode);
  }

  getHsCodeFullText(hs: HsCode): string {
    const description = hs.description ? `說明：${hs.description}` : '說明：無';

    const dutyRate =
      hs.dutyRate !== undefined && hs.dutyRate !== null
        ? `進口稅：${hs.dutyRate}%`
        : '進口稅：無';

    const vatRate =
      hs.vatRate !== undefined && hs.vatRate !== null
        ? `營業稅：${hs.vatRate}%`
        : '營業稅：無';

    return `${hs.code} - ${hs.name}
${description}
${dutyRate}
${vatRate}`;
  }

  getSelectedHsCodeTitle(): string {
    const selectedHsCode = this.hsCodes.find(
      (hs) => hs.id === this.productReq.hsCodeId,
    );

    if (!selectedHsCode) {
      return '請選擇 HS Code';
    }

    return this.getHsCodeFullText(selectedHsCode);
  }

  filterHsCodes(): void {
    const keyword = this.hsCodeSearchKeyword.trim().toLowerCase();

    if (!keyword) {
      this.filteredHsCodes = this.hsCodes.slice(0, 50);
      return;
    }

    this.filteredHsCodes = this.hsCodes
      .filter((hs) => {
        const code = hs.code?.toLowerCase() ?? '';
        const name = hs.name?.toLowerCase() ?? '';
        const description = hs.description?.toLowerCase() ?? '';
        const keywords = (hs as any).keywords?.toLowerCase() ?? '';

        return (
          code.includes(keyword) ||
          name.includes(keyword) ||
          description.includes(keyword) ||
          keywords.includes(keyword)
        );
      })
      .slice(0, 50);
  }

  setCategoryByHsCode(hsCode: HsCode): void {
    console.log('要帶入分類的 HS Code：', hsCode);
    console.log('目前分類清單：', this.categories);

    if (!hsCode) {
      return;
    }

    // 情況 1：如果 HS Code 本身有 categoryId，直接用
    if (hsCode.categoryId !== undefined && hsCode.categoryId !== null) {
      this.productReq.categoryId = Number(hsCode.categoryId);
      console.log('用 categoryId 帶入分類：', this.productReq.categoryId);
      return;
    }

    // 情況 2：目前多數資料只有 categoryName，例如「乾貨」
    const categoryName = hsCode.categoryName?.trim();

    if (!categoryName) {
      console.warn('這筆 HS Code 沒有 categoryName');
      return;
    }

    const matchedCategory = this.categories.find((category) => {
      return category.name?.trim() === categoryName;
    });

    if (!matchedCategory) {
      console.warn('找不到對應分類：', categoryName);
      return;
    }

    this.productReq.categoryId = matchedCategory.id;

    console.log('已自動帶入分類 ID：', this.productReq.categoryId);
  }

  putRecommendedHsCodeIntoOptions(hsCode: HsCode): void {
    const exists = this.filteredHsCodes.some((item) => item.id === hsCode.id);

    if (exists) {
      return;
    }

    this.filteredHsCodes = [hsCode, ...this.filteredHsCodes].slice(0, 50);
  }

  onProductNameInput(): void {
    const productName = this.productReq.name.trim();

    this.hsCodeSearchKeyword = productName;

    this.recommendMessage = '';

    // 商品名稱被改動時，先清掉舊推薦，避免殘留上一筆 HS Code
    this.productReq.categoryId = null;
    this.productReq.hsCodeId = null;

    if (!productName) {
      this.filteredHsCodes = this.hsCodes.slice(0, 50);
      return;
    }

    this.filterHsCodes();
  }

  get uniqueCategories(): Category[] {
    const map = new Map<string, Category>();

    this.categories.forEach((category) => {
      if (!map.has(category.name)) {
        map.set(category.name, category);
      }
    });

    return Array.from(map.values());
  }

  isLowStock(stockQty?: number | null): boolean {
    return (stockQty ?? 0) <= 10;
  }

  getStockStatusLabel(stockQty?: number | null): string {
    if ((stockQty ?? 0) <= 0) {
      return '無庫存';
    }

    if ((stockQty ?? 0) <= 10) {
      return '低庫存';
    }

    return '正常';
  }

  getStockStatusClass(stockQty?: number | null): string {
    if ((stockQty ?? 0) <= 0) {
      return 'stock-empty';
    }

    if ((stockQty ?? 0) <= 10) {
      return 'stock-low';
    }

    return 'stock-normal';
  }
}
