import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-dialog-component',
  imports: [FormsModule, MatButtonModule, MatInputModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './dialog-component.html',
  styleUrl: './dialog-component.scss',
})
export class DialogComponent {
  readonly dialogRef = inject(MatDialogRef<DialogComponent>);

  amount: number | null = null;

  isValid(): boolean {
    return this.amount !== null && this.amount >= 1;
  }

  save() {
    if (this.isValid()) {
      // Pass the amount back to whatever opened this dialog
      this.dialogRef.close(this.amount);
    }
  }
}
