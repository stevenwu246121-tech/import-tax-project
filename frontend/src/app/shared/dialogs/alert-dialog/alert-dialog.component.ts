import { Component, Inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-alert-dialog',
  standalone: true,

  imports: [
    MatDialogModule,
    MatButtonModule
  ],

  template: `
    <h2 mat-dialog-title>
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      {{ data.message }}
    </mat-dialog-content>

    <mat-dialog-actions align="end">

      <button
        mat-raised-button
        color="primary"
        (click)="close()"
      >
        確定
      </button>

    </mat-dialog-actions>
  `
})
export class AlertDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<AlertDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
    }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
