import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface ConfirmData {
  title: string;
  message: string;
  confirmLabel: string;
}

// A little pop-up window that asks "are you sure?". Material does the hard parts:
// it dims the page, keeps the keyboard inside the window, and closes with Escape.
@Component({
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  data = inject<ConfirmData>(MAT_DIALOG_DATA);
}
