import { Component, Inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,

  imports: [
    MatDialogModule,
    MatButtonModule
  ],

  template: `
    <h2 mat-dialog-title>
      確認操作
    </h2>

    <mat-dialog-content>
      {{ data.message }}
    </mat-dialog-content>

    <mat-dialog-actions align="end">

      <button
        mat-button
        (click)="close(false)"
      >
        取消
      </button>

      <button
        mat-raised-button
        color="primary"
        (click)="close(true)"
      >
        確認
      </button>

    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      message: string;
    }
  ) {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
