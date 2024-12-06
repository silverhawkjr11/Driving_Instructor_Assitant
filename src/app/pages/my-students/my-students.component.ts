import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
@Component({
  standalone: true,
  selector: 'app-my-students',
  templateUrl: './my-students.component.html',
  imports: [
    MatTableModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSortModule,
    MatExpansionModule,
    MatIcon
  ],
})
export class MyStudentsComponent {
  private studentService = inject(StudentService);

  students = this.studentService.getStudents();
  showForm = signal(false);
  displayedColumns = ['date', 'duration', 'notes'];

  studentForm = new FormGroup({
    name: new FormControl('', Validators.required),
    lastLesson: new FormControl(null, Validators.required),
  });

  lessonForm = new FormGroup({
    date: new FormControl(null, Validators.required),
    duration: new FormControl(null, [Validators.required, Validators.min(1)]),
    notes: new FormControl(''),
  });

  showAddStudentForm() {
    this.showForm.set(true);
  }

  hideAddStudentForm() {
    this.showForm.set(false);
    this.studentForm.reset();
  }

  addStudent() {
    if (this.studentForm.valid) {
      const formValue = this.studentForm.value;
      const newStudent = {
        id: Date.now(),
        name: formValue.name!,
        lastLesson: formValue.lastLesson!,
      };

      this.studentService.addStudent(newStudent);
      this.hideAddStudentForm();
    }
  }

  addLesson(studentId: number) {
    if (this.lessonForm.valid) {
      const formValue = this.lessonForm.value;
      const newLesson = {
        date: formValue.date!,
        duration: formValue.duration!,
        notes: formValue.notes || '',
      };

      this.studentService.addLesson(studentId, newLesson);
      this.lessonForm.reset();
    }
  }
}
