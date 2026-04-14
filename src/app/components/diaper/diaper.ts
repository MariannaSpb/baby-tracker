import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { DiaperEntry, DiaperEnum, DiaperType } from '../../core/models/diaper.model';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-diaper',
  imports: [A11yModule, CommonModule, MatIconModule],
  templateUrl: './diaper.html',
  styleUrl: './diaper.scss',
})
export class Diaper {
  public Diaper = DiaperEnum;
  private readonly dialogRef = inject<DialogRef<DiaperEntry | undefined>>(DialogRef);


  protected chooseType(type: DiaperType) {
    this.dialogRef.close({
      type,
      timestamp: new Date()
    });
    return;

  }
}
