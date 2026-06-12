import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';

import { HsCode } from '../../models/hs-code';

import { Category } from '../../models/category';

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

  currentPage = 1;

  pageSize = 10;

  categories: Category[] = [];

  keyword = '';

  isSearched = false;

  editingHsCodeId: number | null = null;

  selectedHsCodeForCalc: HsCode | null = null;

  calcPrice: number | null = null;

  calcQuantity: number | null = null;

  calcSubtotal = 0;

  calcDutyAmount = 0;

  calcVatAmount = 0;

  calcLandedCost = 0;

  lastSyncTime = '';

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

  constructor(
    private apiService: ApiService,
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

        this.dialogService.error('HS Code 資料載入失敗');
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

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  toggleActionMenu(id: number): void {
    this.openedActionId = this.openedActionId === id ? null : id;
  }

  search(): void {
    const keyword = this.keyword.trim();

    if (!keyword) {
      this.filteredHsCodes = this.hsCodes;

      this.isSearched = false;

      this.currentPage = 1;

      return;
    }

    this.apiService.searchHsCodes(keyword).subscribe({
      next: (response: HsCode[]) => {
        this.filteredHsCodes = response;

        this.isSearched = true;

        this.currentPage = 1;
      },
      error: (error: unknown) => {
        console.error(error);

        this.filteredHsCodes = [];

        this.isSearched = true;

        this.currentPage = 1;

        this.dialogService.error('HS Code 查詢失敗');
      },
    });
  }

  clearSearch(): void {
    this.keyword = '';

    this.filteredHsCodes = this.hsCodes;

    this.isSearched = false;

    this.currentPage = 1;
  }

  syncOfficialHsCode(): void {
    this.apiService.syncOfficialHsCode().subscribe({
      next: (response) => {
        this.dialogService.success(
          `官方資料同步完成：共 ${response.totalCount} 筆，新增 ${response.createdCount} 筆，更新 ${response.updatedCount} 筆`,
        );

        this.loadHsCodes();

        this.clearSearch();
      },
      error: (error: unknown) => {
        console.error(error);

        this.dialogService.error('官方資料同步失敗');
      },
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
          this.dialogService.success('更新成功');

          this.loadHsCodes();

          this.resetForm();

          this.showForm = false;
        },
        error: (error: unknown) => {
          console.error(error);

          this.dialogService.error('更新失敗');
        },
      });

      return;
    }

    this.apiService.createHsCode(request).subscribe({
      next: () => {
        this.dialogService.success('新增成功');

        this.loadHsCodes();

        this.resetForm();

        this.showForm = false;
      },
      error: (error: unknown) => {
        console.error(error);

        this.dialogService.error('新增失敗');
      },
    });
  }

  isValidHsCode(): boolean {
    if (!this.hsCodeReq.code.trim()) {
      this.dialogService.warning('請輸入 HS Code');

      return false;
    }

    if (!this.hsCodeReq.name.trim()) {
      this.dialogService.warning('請輸入商品名稱');

      return false;
    }

    if (!this.hsCodeReq.categoryId) {
      this.dialogService.warning('請選擇分類');

      return false;
    }

    if (this.hsCodeReq.dutyRate === null) {
      this.dialogService.warning('請輸入 Import Duty');

      return false;
    }

    if (this.hsCodeReq.vatRate === null) {
      this.dialogService.warning('請輸入 VAT');

      return false;
    }

    if (this.hsCodeReq.dutyRate < 0) {
      this.dialogService.warning('Import Duty 不可小於 0');

      return false;
    }

    if (this.hsCodeReq.vatRate < 0) {
      this.dialogService.warning('VAT 不可小於 0');

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
      categoryId: hsCode.categoryId ?? null,
      dutyRate: hsCode.dutyRate,
      vatRate: hsCode.vatRate,
      description: hsCode.description ?? '',
    };
  }

  deleteHsCode(id: number): void {
    this.dialogService
      .confirm('確定要刪除嗎？')
      .subscribe((confirmed: boolean) => {
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

            this.dialogService.error('刪除失敗，可能已有商品使用此 HS Code');
          },
        });
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

  selectHsCodeForCalc(hsCode: HsCode): void {
    this.selectedHsCodeForCalc = hsCode;

    this.calcPrice = null;

    this.calcQuantity = null;

    this.resetCalcResult();
  }

  calculateHsCodeCost(): void {
    if (!this.selectedHsCodeForCalc) {
      return;
    }

    if (this.calcPrice === null || this.calcPrice <= 0) {
      this.resetCalcResult();
      return;
    }

    if (this.calcQuantity === null || this.calcQuantity <= 0) {
      this.resetCalcResult();
      return;
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

  resetCalcResult(): void {
    this.calcSubtotal = 0;

    this.calcDutyAmount = 0;

    this.calcVatAmount = 0;

    this.calcLandedCost = 0;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredHsCodes.length / this.pageSize);
  }

  get pagedHsCodes(): HsCode[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    const endIndex = startIndex + this.pageSize;

    return this.filteredHsCodes.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) {
      return;
    }

    this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage <= 1) {
      return;
    }

    this.currentPage--;
  }
}
