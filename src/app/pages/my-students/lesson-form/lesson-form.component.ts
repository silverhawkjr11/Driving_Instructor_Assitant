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
  templateUrl: './lesson-form.component.html',
})
export class LessonFormComponent {
  @Input() studentId!: number;
  @Output() lessonAdded = new EventEmitter<any>();
  @Output() onLessonAdded = new EventEmitter<any>();

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
