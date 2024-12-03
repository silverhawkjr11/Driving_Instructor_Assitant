import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButton } from '@angular/material/button';
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatButton
  ],
})
export class MyStudentsComponent implements OnInit {
  // TODO: add due payment and num of lessons so far and more
  displayedColumns: string[] = ['id', 'name', 'lastLesson'];
  students = [
    { id: 1, name: 'Alice', lastLesson: '2023-10-01' },
    { id: 2, name: 'Bob', lastLesson: '2023-10-02' },
    { id: 3, name: 'Charlie', lastLesson: '2023-10-03' }
  ];
  newStudent = { name: '', lastLesson: '' };
  showForm = false;

  constructor(private studentService: StudentService) { }

  ngOnInit() {
    this.students = this.studentService.getStudents();
  }

  showAddStudentForm() {
    this.showForm = true;
  }

  hideAddStudentForm() {
    this.showForm = false;
    this.newStudent = { name: '', lastLesson: '' }; // Clear form
  }

  addStudent() {
    if (!this.newStudent.name || !this.newStudent.lastLesson) {
      alert('Please fill in all fields.');
      return;
    }

    const newStudent = {
      id: this.students.length + 1,
      name: this.newStudent.name,
      lastLesson: this.newStudent.lastLesson,
    };
    this.studentService.addStudent(newStudent);
    this.students = [...this.studentService.getStudents()]; // Create a new array reference
    this.hideAddStudentForm(); // Close the form after adding
    console.log('Added student:', newStudent);
    console.log('All students:', this.students);
  }
}
