import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { LessonFormComponent } from '../lesson-form/lesson-form.component';

@Component({
  selector: 'app-student-lessons',
  standalone: true,
  imports: [CommonModule, MatTableModule, LessonFormComponent],
  template: `
    <div class="lessons-section">
      <h3>Lessons</h3>
      @if (student.lessons.length > 0) {
        <table mat-table [dataSource]="student.lessons" class="lessons-table">
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let lesson">{{ lesson.date | date:'shortDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="duration">
            <th mat-header-cell *matHeaderCellDef>Duration</th>
            <td mat-cell *matCellDef="let lesson">{{ lesson.duration }} mins</td>
          </ng-container>

          <ng-container matColumnDef="notes">
            <th mat-header-cell *matHeaderCellDef>Notes</th>
            <td mat-cell *matCellDef="let lesson">{{ lesson.notes }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      } @else {
        <p class="no-lessons">No lessons recorded yet</p>
      }

      <app-lesson-form
        [studentId]="student.id"
        (lessonAdded)="onLessonAdded.emit($event)">
      </app-lesson-form>
    </div>
  `
})
export class StudentLessonsComponent {
  @Input() student!: Student;
  displayedColumns = ['date', 'duration', 'notes'];
}
