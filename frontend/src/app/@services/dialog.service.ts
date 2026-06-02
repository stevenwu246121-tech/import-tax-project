import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { ConfirmDialogComponent } from '../shared/dialogs/confirm-dialog/confirm-dialog.component';

import { AlertDialogComponent } from '../shared/dialogs/alert-dialog/alert-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm(message: string) {
    return this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: { message },
      })
      .afterClosed();
  }

  success(message: string) {
    return this.dialog
      .open(AlertDialogComponent, {
        width: '400px',
        data: {
          title: '成功',
          message,
        },
      })
      .afterClosed();
  }

  error(message: string) {
    return this.dialog
      .open(AlertDialogComponent, {
        width: '400px',
        data: {
          title: '錯誤',
          message,
        },
      })
      .afterClosed();
  }

  warning(message: string) {
    return this.dialog
      .open(AlertDialogComponent, {
        width: '400px',
        data: {
          title: '提醒',
          message,
        },
      })
      .afterClosed();
  }
}
