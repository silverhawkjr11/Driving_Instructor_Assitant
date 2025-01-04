import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  where,
  arrayUnion,
  increment,
  serverTimestamp,
  DocumentReference,
  DocumentData,
  Timestamp,
  getDocs
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { first, from, map, Observable } from 'rxjs';
import { Student } from '../../models/student.model';
import { Lesson } from '../../models/lesson.model';
import { onAuthStateChanged } from '@angular/fire/auth';
import { switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private studentsCollection = collection(this.firestore, 'students');

  getStudents(): Observable<Student[]> {
    const studentsRef = collection(this.firestore, 'students');
    // Query students for current instructor
    const q = query(studentsRef,
      where('instructorId', '==', this.auth.currentUser?.uid)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Student[]>;
  }
  getStudentLessons(studentId: string): Observable<Lesson[]> {
    const lessonsRef = collection(this.firestore, `students/${studentId}/lessons`);
    const q = query(lessonsRef, orderBy('date', 'desc'));

    // Use collectionData instead of getDocs to get real-time updates
    return collectionData(q, { idField: 'id' }).pipe(
      map(lessons => lessons.map(lesson => ({
        ...lesson,
        date: lesson['date'] instanceof Timestamp ?
          lesson['date'].toDate() :
          lesson['date']
      })))
    ) as Observable<Lesson[]>;
  }
  async addStudent(student: Partial<Student>): Promise<DocumentReference<DocumentData>> {
    const studentsRef = collection(this.firestore, 'students');
    return addDoc(studentsRef, {
      ...student,
      createdAt: serverTimestamp(),
      lessonsCompleted: 0,
      lastLesson: null,
      instructorId: this.auth.currentUser?.uid
    });
  }
  async addLesson(studentId: string, lesson: Lesson): Promise<void> {
    const lessonsRef = collection(this.firestore, `students/${studentId}/lessons`);
    await addDoc(lessonsRef, {
      ...lesson,
      date: Timestamp.fromDate(lesson.date), // Convert Date to Timestamp
      createdAt: serverTimestamp()
    });
  }
}
