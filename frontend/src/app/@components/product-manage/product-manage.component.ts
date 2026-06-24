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

type ProductSortMode =
  | 'latestPurchase'
  | 'stockAsc'
  | 'stockDesc'
  | 'priceDesc'
  | 'priceAsc'
  | 'nameAsc';

@Component({
  selector: 'app-product-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-manage.component.html',
  styleUrls: ['./product-manage.component.scss'],
})
export class ProductManageComponent implements OnInit {
  products: Product[] = [];

  selectedProductSort: ProductSortMode = 'latestPurchase';

  private readonly recentPurchasedStorageKey = 'recentPurchasedProductIds';

  recentPurchasedProductIds: number[] = [];

  categories: Category[] = [];

  hsCodes: HsCode[] = [];

  filteredHsCodes: HsCode[] = [];

  hsCodeSearchKeyword = '';

  recommendedHsCodeId: number | null = null;

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

  editingProductId: number | null = null;

  openedActionId: number | null = null;

  constructor(
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loadRecentPurchasedProductIds();

    this.loadProducts();

    this.loadCategories();

    this.loadHsCodes();
  }

  private loadRecentPurchasedProductIds(): void {
    const value = localStorage.getItem(this.recentPurchasedStorageKey);

    if (!value) {
      this.recentPurchasedProductIds = [];

      return;
    }

    try {
      this.recentPurchasedProductIds = JSON.parse(value);
    } catch {
      this.recentPurchasedProductIds = [];
    }
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (response: Product[]) => {
        this.products = response ?? [];
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
        this.categories = response ?? [];
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
        this.hsCodes = response ?? [];

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

  onProductNameInput(): void {
    const productName = this.productReq.name.trim();

    this.hsCodeSearchKeyword = productName;

    this.recommendMessage = '';

    this.recommendedHsCodeId = null;

    this.productReq.categoryId = null;

    this.productReq.hsCodeId = null;

    if (!productName) {
      this.filteredHsCodes = this.hsCodes.slice(0, 50);

      return;
    }

    this.filterHsCodes();
  }

  onProductNameChange(): void {
    this.onProductNameInput();
  }

  recommendHsCode(): void {
    const productName = this.productReq.name?.trim();

    if (!productName) {
      this.dialogService.warning('請先輸入商品名稱');

      return;
    }

    this.recommendMessage = '';
    this.recommendedHsCodeId = null;
    this.productReq.categoryId = null;
    this.productReq.hsCodeId = null;

    this.hsCodeSearchKeyword = productName;

    const relatedHsCodes = this.searchHsCodes(productName);

    if (relatedHsCodes.length === 0) {
      this.filteredHsCodes = this.hsCodes.slice(0, 50);

      this.recommendMessage = '找不到相關 HS Code，請嘗試輸入更明確的商品名稱';

      this.dialogService.warning(this.recommendMessage);

      return;
    }

    this.filteredHsCodes = relatedHsCodes;
    this.recommendedHsCodeId = relatedHsCodes[0].id;

    this.recommendMessage = `已列出與「${productName}」相關的 HS Code，請從下拉選單選擇正確品項`;
  }

  onHsCodeSearchInput(): void {
    this.recommendedHsCodeId = null;

    this.productReq.hsCodeId = null;

    this.productReq.categoryId = null;

    this.recommendMessage = '';

    this.filterHsCodes();
  }

  filterHsCodes(): void {
    const keyword = this.hsCodeSearchKeyword.trim();

    if (!keyword) {
      this.filteredHsCodes = this.hsCodes.slice(0, 50);

      return;
    }

    this.filteredHsCodes = this.searchHsCodes(keyword);
  }

  private searchHsCodes(keyword: string): HsCode[] {
    const normalizedKeyword = this.normalizeText(keyword);

    if (!normalizedKeyword) {
      return this.hsCodes.slice(0, 50);
    }

    return this.hsCodes
      .map((hs) => ({
        hs,
        score: this.getHsCodeMatchScore(hs, normalizedKeyword),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 80)
      .map((item) => item.hs);
  }

  private getHsCodeMatchScore(hs: HsCode, keyword: string): number {
    const code = this.normalizeText(hs.code);

    const name = this.normalizeText(hs.name);

    const description = this.normalizeText(hs.description);

    const categoryName = this.normalizeText(hs.categoryName);

    const keywords = this.normalizeText((hs as any).keywords);

    let score = 0;

    if (code === keyword) {
      score += 120;
    }

    if (code.startsWith(keyword)) {
      score += 100;
    }

    if (code.includes(keyword)) {
      score += 80;
    }

    if (name === keyword) {
      score += 100;
    }

    if (name.includes(keyword)) {
      score += 90;
    }

    if (keywords.includes(keyword)) {
      score += 70;
    }

    if (description.includes(keyword)) {
      score += 50;
    }

    if (categoryName.includes(keyword)) {
      score += 30;
    }

    return score;
  }

  private normalizeText(value?: string | null): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  isRecommendedHsCode(hs: HsCode): boolean {
    return this.recommendedHsCodeId === hs.id;
  }

  onCategoryChange(): void {
    const selectedCategory = this.categories.find(
      (category) => category.id === this.productReq.categoryId,
    );

    this.recommendedHsCodeId = null;

    this.productReq.hsCodeId = null;

    if (!selectedCategory) {
      this.filteredHsCodes = this.hsCodes.slice(0, 50);

      return;
    }

    this.filteredHsCodes = this.hsCodes
      .filter((hsCode) => hsCode.categoryName === selectedCategory.name)
      .slice(0, 80);
  }

  onManualCategoryChange(): void {
    this.isAutoRecommendEnabled = false;

    this.recommendMessage = '';

    this.recommendedHsCodeId = null;

    this.onCategoryChange();
  }

  onManualHsCodeChange(): void {
    this.isAutoRecommendEnabled = false;

    this.recommendMessage = '';

    this.recommendedHsCodeId = null;

    this.onHsCodeChange();
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

  setCategoryByHsCode(hsCode: HsCode): void {
    if (!hsCode) {
      return;
    }

    if (hsCode.categoryId !== undefined && hsCode.categoryId !== null) {
      this.productReq.categoryId = Number(hsCode.categoryId);

      return;
    }

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

    this.recommendedHsCodeId = null;

    const selectedHsCode = this.hsCodes.find(
      (hs) => hs.id === this.productReq.hsCodeId,
    );

    if (selectedHsCode) {
      this.hsCodeSearchKeyword = selectedHsCode.name;

      this.filteredHsCodes = [
        selectedHsCode,
        ...this.searchHsCodes(selectedHsCode.name).filter(
          (hs) => hs.id !== selectedHsCode.id,
        ),
      ].slice(0, 80);

      return;
    }

    this.hsCodeSearchKeyword = '';

    this.filteredHsCodes = this.hsCodes.slice(0, 50);
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

    this.recommendedHsCodeId = null;

    this.editingProductId = null;

    this.openedActionId = null;

    this.recommendMessage = '';

    this.isAutoRecommendEnabled = true;
  }

  filteredProducts(): Product[] {
    const keyword = this.keyword.trim().toLowerCase();

    const filteredProducts = this.products.filter((product) => {
      const matchKeyword =
        !keyword || product.productName.toLowerCase().includes(keyword);

      const matchCategory =
        !this.selectedCategory ||
        product.categoryName === this.selectedCategory;

      return matchKeyword && matchCategory;
    });

    return this.sortProducts(filteredProducts);
  }

  private sortProducts(products: Product[]): Product[] {
    const sortedProducts = [...products];

    switch (this.selectedProductSort) {
      case 'latestPurchase':
        return sortedProducts.sort((a, b) => {
          const indexA = this.recentPurchasedProductIds.indexOf(a.id);

          const indexB = this.recentPurchasedProductIds.indexOf(b.id);

          const aIsRecent = indexA !== -1;

          const bIsRecent = indexB !== -1;

          if (aIsRecent && bIsRecent) {
            return indexA - indexB;
          }

          if (aIsRecent) {
            return -1;
          }

          if (bIsRecent) {
            return 1;
          }

          return b.id - a.id;
        });

      case 'stockAsc':
        return sortedProducts.sort(
          (a, b) => (a.stockQty ?? 0) - (b.stockQty ?? 0),
        );

      case 'stockDesc':
        return sortedProducts.sort(
          (a, b) => (b.stockQty ?? 0) - (a.stockQty ?? 0),
        );

      case 'priceDesc':
        return sortedProducts.sort(
          (a, b) => (b.unitPrice ?? 0) - (a.unitPrice ?? 0),
        );

      case 'priceAsc':
        return sortedProducts.sort(
          (a, b) => (a.unitPrice ?? 0) - (b.unitPrice ?? 0),
        );

      case 'nameAsc':
        return sortedProducts.sort((a, b) =>
          (a.productName ?? '').localeCompare(b.productName ?? '', 'zh-Hant'),
        );

      default:
        return sortedProducts;
    }
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

  get productCount(): number {
    return this.products.length;
  }

  get inventoryTotal(): number {
    return this.products.reduce(
      (sum, product) => sum + (product.stockQty ?? 0),
      0,
    );
  }

  get categoryCount(): number {
    const categoryNames = this.products
      .map((product) => product.categoryName)
      .filter((categoryName): categoryName is string => !!categoryName);

    return new Set(categoryNames).size;
  }

  get lowStockCount(): number {
    return this.products.filter((product) => (product.stockQty ?? 0) <= 10)
      .length;
  }

  getUnitLabel(unit?: string): string {
    switch (unit) {
      case 'kg':
        return '公斤 kg';
      case 'g':
        return '公克 g';
      default:
        return unit || '-';
    }
  }

  formatHsCodeOption(hs: HsCode): string {
    const prefix = this.isRecommendedHsCode(hs) ? '⭐ 推薦 ' : '';

    const text = `${prefix}${hs.code} - ${hs.name}`;

    return text.length > 34 ? text.slice(0, 34) + '...' : text;
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

  putRecommendedHsCodeIntoOptions(hsCode: HsCode): void {
    this.filteredHsCodes = [
      hsCode,
      ...this.filteredHsCodes.filter((item) => item.id !== hsCode.id),
    ].slice(0, 80);
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
