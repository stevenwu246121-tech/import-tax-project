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
  const keyword = this.keyword.trim().toLowerCase();

  if (!keyword) {
    this.filteredHsCodes = this.hsCodes;
    return;
  }

  this.filteredHsCodes = this.hsCodes.filter(item => {
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
}
