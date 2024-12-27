import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Student } from '../../../services/student.service';

@Component({
  selector: 'app-student-nav',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './student-nav.component.html',
})
export class StudentNavComponent {
  private i!: number;
  @Input() students!: Student[];
  @Input() currentIndex!: number;
  @Output() studentSelected = new EventEmitter<number>();
  @Output() addStudent = new EventEmitter<void>();
}
