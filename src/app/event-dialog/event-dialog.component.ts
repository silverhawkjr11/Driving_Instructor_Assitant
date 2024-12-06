import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class AddEventDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  eventForm: FormGroup;
  timeOptions: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.generateTimeOptions();
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: [new Date(), Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required],
      color: ['#1976d2']
    });
  }

  ngOnInit() {
    if (this.data.event) {
      const event = this.data.event;
      this.eventForm.patchValue({
        title: event.title,
        date: event.start,
        startTime: this.formatTime(event.start),
        endTime: this.formatTime(event.end),
        color: event.color
      });
    } else if (this.data.date && this.data.hour !== undefined) {
      this.eventForm.patchValue({
        date: this.data.date,
        startTime: `${String(this.data.hour).padStart(2, '0')}:00`,
        endTime: `${String(this.data.hour + 1).padStart(2, '0')}:00`
      });
    }
  }

  generateTimeOptions() {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        this.timeOptions.push(
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        );
      }
    }
  }

  formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  createDateFromTimeString(baseDate: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      const baseDate = formValue.date;

      const result = {
        title: formValue.title,
        start: this.createDateFromTimeString(baseDate, formValue.startTime),
        end: this.createDateFromTimeString(baseDate, formValue.endTime),
        color: formValue.color
      };

      this.dialogRef.close(result);
    }
  }
}
