import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { animate, style, transition, trigger } from '@angular/animations';
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
  animations: [
    trigger('cardAnimation', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class MyStudentsComponent {
  private studentService = inject(StudentService);

  students = this.studentService.getStudents();
  currentStudentIndex = signal(0);
  showForm = signal(false);
  displayedColumns = ['date', 'duration', 'notes'];

  currentStudent = computed(() => {
    const students = this.students();
    return students[this.currentStudentIndex()];
  });

  studentForm = new FormGroup({
    name: new FormControl('', Validators.required),
    lastLesson: new FormControl(null, Validators.required),
  });

  lessonForm = new FormGroup({
    date: new FormControl(null, Validators.required),
    duration: new FormControl(null, [Validators.required, Validators.min(1)]),
    notes: new FormControl(''),
  });

  setCurrentStudent(index: number) {
    this.currentStudentIndex.set(index);
  }

  nextStudent() {
    if (this.currentStudentIndex() < this.students().length - 1) {
      this.currentStudentIndex.update(i => i + 1);
    }
  }

  previousStudent() {
    if (this.currentStudentIndex() > 0) {
      this.currentStudentIndex.update(i => i - 1);
    }
  }

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
