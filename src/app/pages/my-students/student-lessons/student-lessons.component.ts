import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { LessonFormComponent } from '../lesson-form/lesson-form.component';
import { Student } from '../../../services/student.service';

@Component({
  selector: 'app-student-lessons',
  standalone: true,
  imports: [CommonModule, MatTableModule, LessonFormComponent],
  templateUrl: './student-lessons.component.html',
})
export class StudentLessonsComponent {
  @Input() student!: Student;
  displayedColumns = ['date', 'duration', 'notes'];
}
