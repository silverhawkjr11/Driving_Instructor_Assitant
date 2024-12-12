import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Student } from '../../../services/student.service';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './student-card.component.html',
})
export class StudentCardComponent {
  @Input() student!: Student;
  @Input() currentIndex!: number;
  @Input() totalStudents!: number;
  @Input() isFirst!: boolean;
  @Input() isLast!: boolean;

  @Output() previousStudent = new EventEmitter<void>();
  @Output() nextStudent = new EventEmitter<void>();
  @Output() onTouchStart = new EventEmitter<TouchEvent>();
  @Output() onTouchMove = new EventEmitter<TouchEvent>();
  @Output() onTouchEnd = new EventEmitter<TouchEvent>();
}
