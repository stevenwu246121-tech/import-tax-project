import { Component, Inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';

import { PurchaseOrder }
from '../../../models/purchase-order';

@Component({
  selector: 'app-order-detail-dialog',

  standalone: true,

  imports: [
    CommonModule,
    MatDialogModule
  ],

  templateUrl: './order-detail-dialog.component.html',

  styleUrl: './order-detail-dialog.component.scss'
})
export class OrderDetailDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public order: PurchaseOrder
  ) {}

}
