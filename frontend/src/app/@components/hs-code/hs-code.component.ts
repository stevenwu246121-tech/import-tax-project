import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../@services/api.service';

import { HsCode } from '../../models/hs-code';

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

  keyword: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadHsCodes();
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

  search(): void {
    const keyword = this.keyword.toLowerCase();

    this.filteredHsCodes = this.hsCodes.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.categoryName.toLowerCase().includes(keyword),
    );
  }
}
