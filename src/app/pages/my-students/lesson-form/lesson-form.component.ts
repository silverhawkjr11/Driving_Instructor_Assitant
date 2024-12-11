import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule
  ],
  template: `
    <form [formGroup]="lessonForm" (ngSubmit)="onSubmit()" class="lesson-form">
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Duration (minutes)</mat-label>
          <input matInput type="number" formControlName="duration">
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="notes-field">
        <mat-label>Notes</mat-label>
        <textarea matInput formControlName="notes" rows="2"></textarea>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="!lessonForm.valid">
        Add Lesson
      </button>
    </form>
  `
})
export class LessonFormComponent {
  @Input() studentId!: number;
  @Output() lessonAdded = new EventEmitter<any>();

  lessonForm = new FormGroup({
    date: new FormControl(null, Validators.required),
    duration: new FormControl(null, [Validators.required, Validators.min(1)]),
    notes: new FormControl(''),
  });

  onSubmit() {
    if (this.lessonForm.valid) {
      this.lessonAdded.emit({
        studentId: this.studentId,
        ...this.lessonForm.value
      });
      this.lessonForm.reset();
    }
  }
}
