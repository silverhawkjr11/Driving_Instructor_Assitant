import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private students = [
    { id: 1, name: 'Alice', lastLesson: '2024-11-01' },
    { id: 2, name: 'Bob', lastLesson: '2024-11-15' },
    { id: 3, name: 'Charlie', lastLesson: '2024-11-20' },
  ];

  getStudents() {
    return this.students;
  }

  addStudent(student: { id: number; name: string; lastLesson: string }) {
    this.students.push(student);
  }
}
