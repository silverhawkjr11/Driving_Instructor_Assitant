import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Student } from '../../../services/student.service';

@Component({
  selector: 'app-student-nav',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="navigation-header">
      <div class="student-nav">
        @for (student of students; track student.id) {
          <button mat-button
                  [class.active]="currentIndex === i"
                  (click)="studentSelected.emit(i)">
            {{ student.name }}
          </button>
        }
      </div>
      <button mat-mini-fab color="primary" (click)="addStudent.emit()">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `
})
export class StudentNavComponent {
  private i!: number;
  @Input() students!: Student[];
  @Input() currentIndex!: number;
  @Output() studentSelected = new EventEmitter<number>();
  @Output() addStudent = new EventEmitter<void>();
}
