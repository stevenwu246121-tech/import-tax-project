import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';

import { HsCode } from '../../models/hs-code';

import { Category } from '../../models/category';
import { ExchangeRateService } from '../../@services/exchange-rate.service';
import { DialogService } from '../../@services/dialog.service';

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

  selectedHsCodeForCalc: any = null;

  calcPrice: number | null = null;

  calcQuantity = 1;

  calcSubtotal = 0;

  calcDutyAmount = 0;

  calcVatAmount = 0;

  calcLandedCost = 0;

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

  showForm = false;

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  toggleActionMenu(id: number): void {
    this.openedActionId = this.openedActionId === id ? null : id;
  }

  constructor(
    private apiService: ApiService,
    private exchangeRateService: ExchangeRateService,
    private dialogService: DialogService,
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
      this.apiService.updateHsCode(this.editingHsCodeId, request).subscribe({
        next: () => {
          this.dialogService.success('新增成功');

          this.loadHsCodes();

          this.resetForm();

          this.showForm = false;
        },
        error: (error: unknown) => {
          console.error(error);
          this.dialogService.success('更新失敗');
        },
      });

      return;
    }

    this.apiService.createHsCode(request).subscribe({
      next: () => {
        this.dialogService.success('更新成功');

        this.loadHsCodes();

        this.resetForm();

        this.showForm = false;
      },
      error: (error: unknown) => {
        console.error(error);
        this.dialogService.success('新增失敗');
      },
    });
  }

  isValidHsCode(): boolean {
    if (!this.hsCodeReq.code.trim()) {
      this.dialogService.success('請輸入 HS Code');
      return false;
    }

    if (!this.hsCodeReq.name.trim()) {
      this.dialogService.success('請輸入商品名稱');
      return false;
    }

    if (!this.hsCodeReq.categoryId) {
      this.dialogService.success('請選擇分類');
      return false;
    }

    if (this.hsCodeReq.dutyRate === null) {
      this.dialogService.success('請輸入 Import Duty');
      return false;
    }

    if (this.hsCodeReq.vatRate === null) {
      this.dialogService.success('請輸入 VAT');
      return false;
    }

    if (this.hsCodeReq.dutyRate < 0) {
      this.dialogService.success('Import Duty 不可小於 0');
      return false;
    }

    if (this.hsCodeReq.vatRate < 0) {
      this.dialogService.success('VAT 不可小於 0');
      return false;
    }

    return true;
  }

  editHsCode(hsCode: HsCode): void {
    this.showForm = true;

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
    const confirmed = this.dialogService.confirm('確定要刪除嗎？');

    if (!confirmed) {
      return;
    }

    this.apiService.deleteHsCode(id).subscribe({
      next: () => {
        this.dialogService.success('刪除成功');
        this.loadHsCodes();
      },
      error: (error: unknown) => {
        console.error(error);
        this.dialogService.success('刪除失敗，可能已有商品使用此 HS Code');
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

  //選擇 HS Code 方法
  selectHsCodeForCalc(hsCode: any): void {
    this.selectedHsCodeForCalc = hsCode;

    this.calcPrice = null;

    this.calcQuantity = 1;

    this.resetCalcResult();
  }

  //試算方法
  calculateHsCodeCost(): void {
    if (!this.selectedHsCodeForCalc) {
      return;
    }

    if (!this.calcPrice || this.calcPrice <= 0) {
      return;
    }

    if (!this.calcQuantity || this.calcQuantity <= 0) {
      this.calcQuantity = 1;
    }

    const price = this.calcPrice;

    const quantity = this.calcQuantity;

    const dutyRate = this.selectedHsCodeForCalc.dutyRate ?? 0;

    const vatRate = this.selectedHsCodeForCalc.vatRate ?? 0;

    this.calcSubtotal = price * quantity;

    this.calcDutyAmount = (this.calcSubtotal * dutyRate) / 100;

    this.calcVatAmount =
      ((this.calcSubtotal + this.calcDutyAmount) * vatRate) / 100;

    this.calcLandedCost =
      this.calcSubtotal + this.calcDutyAmount + this.calcVatAmount;
  }

  //reset方法
  resetCalcResult(): void {
    this.calcSubtotal = 0;

    this.calcDutyAmount = 0;

    this.calcVatAmount = 0;

    this.calcLandedCost = 0;
  }
}
