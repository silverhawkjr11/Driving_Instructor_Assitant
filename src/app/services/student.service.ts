import { Injectable, signal, Signal, computed, inject } from '@angular/core';
import { addDoc, arrayUnion, collection, collectionData, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Student } from '../../models/student.model';
import { Lesson } from '../../models/lesson.model';



@Injectable({
  providedIn: 'root',
})
export class StudentService {
  firestore = inject(Firestore);
  // private students = signal<Student[]>([
  //   {
  //     id: 1,
  //     lessons: [
  //       { date: new Date('2024-10-01'), duration: 60, notes: 'First lesson' },
  //       { date: new Date('2024-10-15'), duration: 45, notes: 'Parking practice' },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: 'Bob',
  //     lastLesson: '2024-11-15',
  //     lessons: [
  //       { date: new Date('2024-09-20'), duration: 30, notes: 'Introduction' },
  //     ],
  //   },
  // ]);
  //
  students = collection(this.firestore, 'students');
  getStudents(): Signal<Student[]> {
    return collectionData(this.students, {
      idField: 'id'
    }) as unknown as Signal<Student[]>;
  }

  addStudent(student: Omit<Student, 'lessons'>) {
  return addDoc(this.students, {
    ...student,
    lessons: []
  });
  }

  addLesson(studentId: number, lesson: Lesson) {
    // Get a reference to the specific student document and update its lessons array
    return updateDoc(doc(this.firestore, 'students', studentId.toString()), {
      lessons: arrayUnion(lesson),
      lastLesson: lesson.date.toISOString().split('T')[0]
    });
  }
}
