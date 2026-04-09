import { Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FeedEntry, FeedType } from '../../core/models/feed.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/dialog-component/dialog-component';


@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [A11yModule, CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class FeedComponent {
  private readonly dialogRef = inject<DialogRef<FeedEntry | undefined>>(DialogRef);
  private readonly matDialog = inject(MatDialog);

  protected chooseType(type: FeedType) {
    // If no amount is needed, close immediately and return the entry
    if (type === 'breast' || type === 'solids') {
      this.dialogRef.close({
        type,
        timestamp: new Date()
      });
      return;
    }

    // If an amount IS needed, open the Material Dialog
    const amountDialogRef = this.matDialog.open(DialogComponent, {
      width: '350px',
      disableClose: true // Prevents closing by clicking outside, forces 'Back' or 'Ok'
    });

    amountDialogRef.afterClosed().subscribe((amount: number | undefined) => {
      if (amount) {
        // The user entered an amount and clicked "Ok". 
        // Close the main dialog and return the FULL entry to the service.
        this.dialogRef.close({
          type,
          amount,
          timestamp: new Date()
        });
      }
      // If amount is undefined (they clicked "Back"), we do nothing.
      // The secondary dialog closes, and they are back at the type selection screen.
    });
  }
  protected close() {
    this.dialogRef.close();
  }
}
