import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';

import { HsCode } from '../../models/hs-code';

import { Category } from '../../models/category';
import { ExchangeRateService } from '../../@services/exchange-rate.service';

@Component({
  selector: 'app-hs-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hs-code.component.html',
  styleUrls: ['./hs-code.component.scss'],
})
export class HsCodeComponent implements OnInit {
  hsCodes: HsCode[] = [];

  filteredHsCodes: HsCode[] = [];

  categories: Category[] = [];

  keyword = '';

  editingHsCodeId: number | null = null;

  hsCodeReq: {
  code: string;
  name: string;
  categoryId: number | null;
  dutyRate: number | null;
  vatRate: number | null;
  description: string;
} = {
  code: '',
  name: '',
  categoryId: null,
  dutyRate: null,
  vatRate: null,
  description: '',
};

  openedActionId: number | null = null;

  toggleActionMenu(id: number): void {
    this.openedActionId = this.openedActionId === id ? null : id;
  }

  constructor(private apiService: ApiService,
    private exchangeRateService: ExchangeRateService
  ) {}

  ngOnInit(): void {
    this.loadHsCodes();
    this.loadCategories();
  }

  loadHsCodes(): void {
    this.apiService.getHsCodes().subscribe({
      next: (response: HsCode[]) => {
        this.hsCodes = response;
        this.filteredHsCodes = response;
      },
      error: (error: unknown) => {
        console.error(error);
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
      },
    });
  }

  search(): void {
    const keyword = this.keyword.trim().toLowerCase();

    if (!keyword) {
      this.filteredHsCodes = this.hsCodes;
      return;
    }

    this.filteredHsCodes = this.hsCodes.filter((item) => {
      const name = item.name?.toLowerCase() ?? '';
      const code = item.code?.toLowerCase() ?? '';
      const categoryName = item.categoryName?.toLowerCase() ?? '';
      const description = item.description?.toLowerCase() ?? '';

      return (
        name.includes(keyword) ||
        code.includes(keyword) ||
        categoryName.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }

  submitHsCode(): void {

    const request = {
    code: this.hsCodeReq.code,
    name: this.hsCodeReq.name,
    categoryId: this.hsCodeReq.categoryId,
    dutyRate: this.hsCodeReq.dutyRate,
    vatRate: this.hsCodeReq.vatRate,
    description: this.hsCodeReq.description,
    };
    if (!this.isValidHsCode()) {
      return;
    }

    if (this.editingHsCodeId) {
      this.apiService
        .updateHsCode(this.editingHsCodeId, request)
        .subscribe({
          next: () => {
            alert('更新成功');
            this.loadHsCodes();
            this.resetForm();
          },
          error: (error: unknown) => {
            console.error(error);
            alert('更新失敗');
          },
        });

      return;
    }

    this.apiService.createHsCode(request).subscribe({
      next: () => {
        alert('新增成功');
        this.loadHsCodes();
        this.resetForm();
      },
      error: (error: unknown) => {
        console.error(error);
        alert('新增失敗');
      },
    });
  }

  isValidHsCode(): boolean {
  if (!this.hsCodeReq.code.trim()) {
    alert('請輸入 HS Code');
    return false;
  }

  if (!this.hsCodeReq.name.trim()) {
    alert('請輸入商品名稱');
    return false;
  }

  if (!this.hsCodeReq.categoryId) {
    alert('請選擇分類');
    return false;
  }

  if (this.hsCodeReq.dutyRate === null) {
    alert('請輸入 Import Duty');
    return false;
  }

  if (this.hsCodeReq.vatRate === null) {
    alert('請輸入 VAT');
    return false;
  }

  if (this.hsCodeReq.dutyRate < 0) {
    alert('Import Duty 不可小於 0');
    return false;
  }

  if (this.hsCodeReq.vatRate < 0) {
    alert('VAT 不可小於 0');
    return false;
  }

  return true;
}

  editHsCode(hsCode: HsCode): void {
    this.editingHsCodeId = hsCode.id;

    this.hsCodeReq = {
      code: hsCode.code,
      name: hsCode.name,
      categoryId: hsCode.categoryId,
      dutyRate: hsCode.dutyRate,
      vatRate: hsCode.vatRate,
      description: hsCode.description ?? '',
    };
  }

  deleteHsCode(id: number): void {
    const confirmed = confirm('確定要刪除嗎？');

    if (!confirmed) {
      return;
    }

    this.apiService.deleteHsCode(id).subscribe({
      next: () => {
        alert('刪除成功');
        this.loadHsCodes();
      },
      error: (error: unknown) => {
        console.error(error);
        alert('刪除失敗，可能已有商品使用此 HS Code');
      },
    });
  }

resetForm(): void {
  this.hsCodeReq = {
    code: '',
    name: '',
    categoryId: null,
    dutyRate: null,
    vatRate: null,
    description: '',
  };

  this.editingHsCodeId = null;
}
}
