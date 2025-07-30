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
      instructorId: this.auth.currentUser?.uid,
      // Add default values for new fields
      balance: 0,
      paymentStatus: 'PAID_UP',
      lastPaymentDate: null,
      progressNotes: '',
      isReadyForTest: false
    });
  }

  // ADD THIS MISSING METHOD
  async updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    const studentRef = doc(this.firestore, 'students', studentId);

    // Convert Date objects to Timestamps for Firestore
    const firestoreUpdates: any = { ...updates };

    if (updates.lastLesson && updates.lastLesson instanceof Date) {
      firestoreUpdates.lastLesson = Timestamp.fromDate(updates.lastLesson);
    }

    if (updates.lastPaymentDate && updates.lastPaymentDate instanceof Date) {
      firestoreUpdates.lastPaymentDate = Timestamp.fromDate(updates.lastPaymentDate);
    }

    await updateDoc(studentRef, firestoreUpdates);
  }

  async addLesson(studentId: string, lesson: Lesson): Promise<void> {
    const lessonsRef = collection(this.firestore, `students/${studentId}/lessons`);
    await addDoc(lessonsRef, {
      ...lesson,
      date: Timestamp.fromDate(lesson.date), // Convert Date to Timestamp
      createdAt: serverTimestamp()
    });
  }

  // ADD METHOD TO RECORD PAYMENT
  async recordPayment(studentId: string, amount: number, method: string = 'CASH'): Promise<void> {
    // Add payment to payments subcollection
    const paymentsRef = collection(this.firestore, `students/${studentId}/payments`);
    await addDoc(paymentsRef, {
      amount,
      method,
      date: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // Update student balance and payment status
    const studentRef = doc(this.firestore, 'students', studentId);
    await updateDoc(studentRef, {
      balance: increment(-amount), // Reduce balance by payment amount
      lastPaymentDate: serverTimestamp()
    });
  }

  // ADD METHOD TO UPDATE PROGRESS NOTES
  async updateProgressNotes(studentId: string, notes: string): Promise<void> {
    const studentRef = doc(this.firestore, 'students', studentId);
    await updateDoc(studentRef, {
      progressNotes: notes
    });
  }

  // ADD METHOD TO GET STUDENT BY ID
  async getStudentById(studentId: string): Promise<Observable<Student | undefined>> {
    const studentRef = doc(this.firestore, 'students', studentId);
    return from(collectionData(collection(this.firestore, 'students'), { idField: 'id' })).pipe(
      map(students => students.find(s => s['id'] === studentId))
    ) as Observable<Student | undefined>;
  }
}