import { Injectable, signal, Signal, computed } from '@angular/core';

export interface Lesson {
  date: Date;
  duration: number;
  notes: string;
}

export interface Student {
  id: number;
  name: string;
  lastLesson: string;
  lessons: Lesson[];
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private students = signal<Student[]>([
    {
      id: 1,
      name: 'Alice',
      lastLesson: '2024-11-01',
      lessons: [
        { date: new Date('2024-10-01'), duration: 60, notes: 'First lesson' },
        { date: new Date('2024-10-15'), duration: 45, notes: 'Parking practice' },
      ],
    },
    {
      id: 2,
      name: 'Bob',
      lastLesson: '2024-11-15',
      lessons: [
        { date: new Date('2024-09-20'), duration: 30, notes: 'Introduction' },
      ],
    },
  ]);

  getStudents(): Signal<Student[]> {
    return this.students.asReadonly();
  }

  addStudent(student: Omit<Student, 'lessons'>) {
    this.students.update(currentStudents => [
      ...currentStudents,
      { ...student, lessons: [] }
    ]);
  }

  addLesson(studentId: number, lesson: Lesson) {
    this.students.update(currentStudents =>
      currentStudents.map(student =>
        student.id === studentId
          ? { ...student, lessons: [...student.lessons, lesson] }
          : student
      )
    );
  }
}
