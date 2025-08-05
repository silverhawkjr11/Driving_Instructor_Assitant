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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Student } from '../../models/student.model';
import { MatIconModule } from '@angular/material/icon';

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
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class AddEventDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  eventForm: FormGroup;
  timeOptions: string[] = [];
  durationOptions: number[] = [15, 30, 45, 60, 90, 120];
  students: Student[] = [];
  filteredStudents: Student[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.generateTimeOptions();
    this.students = data.students || [];
    this.filteredStudents = this.students;
    
    this.eventForm = this.fb.group({
      studentName: ['', Validators.required],
      date: [new Date(), Validators.required],
      startTime: ['09:00', Validators.required],
      duration: [45, Validators.required],
      cost: [50, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit() {
    if (this.data.event) {
      // Editing existing event/lesson
      const event = this.data.event;
      const lesson = event.extendedProps?.lesson;
      
      this.eventForm.patchValue({
        studentName: event.title || lesson?.studentName || '',
        date: event.start || lesson?.date,
        startTime: event.start ? this.formatTime(event.start) : lesson?.startTime || '09:00',
        duration: lesson?.duration || this.calculateDuration(event.start, event.end) || 45,
        cost: lesson?.cost || 50,
        notes: lesson?.notes || ''
      });
      
      // For editing, disable student selection to prevent changing student
      this.eventForm.get('studentName')?.disable();
    } else if (this.data.lesson) {
      // Editing existing lesson directly
      const lesson = this.data.lesson;
      this.eventForm.patchValue({
        studentName: lesson.studentName,
        date: lesson.date,
        startTime: lesson.startTime,
        duration: lesson.duration,
        cost: lesson.cost,
        notes: lesson.notes || ''
      });
      
      // For editing, disable student selection
      this.eventForm.get('studentName')?.disable();
    } else if (this.data.date && this.data.hour !== undefined) {
      // Creating new event with predefined time
      this.eventForm.patchValue({
        date: this.data.date,
        startTime: `${String(this.data.hour).padStart(2, '0')}:00`,
        duration: 45,
        cost: 50
      });
    } else {
      // Creating new event with default values
      this.eventForm.patchValue({
        duration: 45,
        cost: 50
      });
    }

    // Set up student name filtering (only for new lessons)
    if (!this.data.event && !this.data.lesson) {
      this.eventForm.get('studentName')?.valueChanges.subscribe(value => {
        this.filterStudents(value);
      });
    }
  }

  generateTimeOptions() {
    for (let hour = 6; hour < 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        this.timeOptions.push(
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        );
      }
    }
  }

  filterStudents(value: string) {
    if (!value) {
      this.filteredStudents = this.students;
      return;
    }
    
    this.filteredStudents = this.students.filter(student =>
      student.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  onStudentSelected(student: Student) {
    this.eventForm.patchValue({
      studentName: student.name
    });
  }

  formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  calculateDuration(start: Date, end: Date): number {
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }

  createDateFromTimeString(baseDate: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  getEndTime(): string {
    const startTime = this.eventForm.get('startTime')?.value;
    const duration = this.eventForm.get('duration')?.value;
    
    if (!startTime || !duration) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.getRawValue(); // Use getRawValue to get disabled fields too
      const baseDate = formValue.date;
      const startDateTime = this.createDateFromTimeString(baseDate, formValue.startTime);
      const endDateTime = new Date(startDateTime.getTime() + formValue.duration * 60000);

      const result = {
        isEdit: !!(this.data.event || this.data.lesson),
        originalEvent: this.data.event,
        originalLesson: this.data.lesson,
        title: formValue.studentName,
        start: startDateTime,
        end: endDateTime,
        cost: formValue.cost,
        notes: formValue.notes,
        duration: formValue.duration,
        studentName: formValue.studentName
      };

      this.dialogRef.close(result);
    }
  }

  onDelete(): void {
    if (this.data.event || this.data.lesson) {
      const result = {
        delete: true,
        event: this.data.event,
        lesson: this.data.lesson
      };
      this.dialogRef.close(result);
    }
  }

  displayStudentName(studentName: string): string {
    return studentName || '';
  }
}