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
  getDocs,
  docData
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { first, from, map, Observable, of, switchMap, filter } from 'rxjs';
import { Student } from '../../models/student.model';
import { Lesson } from '../../models/lesson.model';
import { authState } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  getStudents(): Observable<Student[]> {
    // Wait for authentication state and only proceed when user is authenticated
    return authState(this.auth).pipe(
      filter(user => !!user), // Only proceed when user is authenticated
      switchMap(user => {
        if (!user?.uid) {
          return of([]); // Return empty array if no user
        }
        
        const studentsRef = collection(this.firestore, 'students');
        const q = query(studentsRef, where('instructorId', '==', user.uid));
        
        return collectionData(q, { idField: 'id' }).pipe(
          map(students => students.map(student => ({
            ...student,
            // Convert Firestore Timestamps to Dates
            startDate: student['startDate'] instanceof Timestamp ? 
              student['startDate'].toDate() : 
              student['startDate'],
            lastLesson: student['lastLesson'] instanceof Timestamp ? 
              student['lastLesson'].toDate() : 
              student['lastLesson'],
            lastPaymentDate: student['lastPaymentDate'] instanceof Timestamp ? 
              student['lastPaymentDate'].toDate() : 
              student['lastPaymentDate'],
            createdAt: student['createdAt'] instanceof Timestamp ? 
              student['createdAt'].toDate() : 
              student['createdAt']
          }) as Student))
        );
      })
    );
  }

  getStudentLessons(studentId: string): Observable<Lesson[]> {
    if (!studentId) {
      return of([]); // Return empty array for invalid studentId
    }

    const lessonsRef = collection(this.firestore, `students/${studentId}/lessons`);
    const q = query(lessonsRef, orderBy('date', 'desc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(lessons => lessons.map(lesson => ({
        ...lesson,
        date: lesson['date'] instanceof Timestamp ?
          lesson['date'].toDate() :
          new Date(lesson['date']), // Ensure it's always a Date object
        createdAt: lesson['createdAt'] instanceof Timestamp ?
          lesson['createdAt'].toDate() :
          lesson['createdAt']
      }) as Lesson))
    );
  }

  async addStudent(student: Partial<Student>): Promise<DocumentReference<DocumentData>> {
    const currentUser = this.auth.currentUser;
    if (!currentUser?.uid) {
      throw new Error('User must be authenticated to add a student');
    }

    const studentsRef = collection(this.firestore, 'students');
    return addDoc(studentsRef, {
      ...student,
      createdAt: serverTimestamp(),
      lessonsCompleted: 0,
      lastLesson: null,
      instructorId: currentUser.uid,
      // Add default values for new fields
      balance: 0,
      paymentStatus: 'PAID_UP',
      lastPaymentDate: null,
      progressNotes: '',
      isReadyForTest: false
    });
  }

  async updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    if (!studentId) {
      throw new Error('Student ID is required for update');
    }

    const studentRef = doc(this.firestore, 'students', studentId);

    // Convert Date objects to Timestamps for Firestore
    const firestoreUpdates: any = { ...updates };

    if (updates.lastLesson && updates.lastLesson instanceof Date) {
      firestoreUpdates.lastLesson = Timestamp.fromDate(updates.lastLesson);
    }

    if (updates.lastPaymentDate && updates.lastPaymentDate instanceof Date) {
      firestoreUpdates.lastPaymentDate = Timestamp.fromDate(updates.lastPaymentDate);
    }

    if (updates.startDate && updates.startDate instanceof Date) {
      firestoreUpdates.startDate = Timestamp.fromDate(updates.startDate);
    }

    await updateDoc(studentRef, firestoreUpdates);
  }

  async addLesson(studentId: string, lesson: Lesson): Promise<void> {
    if (!studentId) {
      throw new Error('Student ID is required to add a lesson');
    }

    const lessonsRef = collection(this.firestore, `students/${studentId}/lessons`);
    
    // Ensure date is a valid Date object
    const lessonDate = lesson.date instanceof Date ? lesson.date : new Date(lesson.date);
    
    await addDoc(lessonsRef, {
      ...lesson,
      date: Timestamp.fromDate(lessonDate),
      createdAt: serverTimestamp()
    });
  }

  async recordPayment(studentId: string, amount: number, method: string = 'CASH'): Promise<void> {
    if (!studentId || amount <= 0) {
      throw new Error('Valid student ID and positive amount are required');
    }

    try {
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
        lastPaymentDate: serverTimestamp(),
        paymentStatus: 'PAID_UP' // Assume paid up after payment - you might want to calculate this
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  async updateProgressNotes(studentId: string, notes: string): Promise<void> {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const studentRef = doc(this.firestore, 'students', studentId);
    await updateDoc(studentRef, {
      progressNotes: notes
    });
  }

  getStudentById(studentId: string): Observable<Student | undefined> {
    if (!studentId) {
      return of(undefined);
    }

    const studentRef = doc(this.firestore, 'students', studentId);
    return docData(studentRef, { idField: 'id' }).pipe(
      map((student: any) => {
        if (!student) return undefined;
        
        return {
          ...student,
          // Convert Firestore Timestamps to Dates
          startDate: student['startDate'] instanceof Timestamp ? 
            student['startDate'].toDate() : 
            student['startDate'],
          lastLesson: student['lastLesson'] instanceof Timestamp ? 
            student['lastLesson'].toDate() : 
            student['lastLesson'],
          lastPaymentDate: student['lastPaymentDate'] instanceof Timestamp ? 
            student['lastPaymentDate'].toDate() : 
            student['lastPaymentDate'],
          createdAt: student['createdAt'] instanceof Timestamp ? 
            student['createdAt'].toDate() : 
            student['createdAt']
        } as Student;
      })
    );
  }

  // Helper method to get current user safely
  private getCurrentUser() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }
    return user;
  }

  // Method to check if service is ready (user is authenticated)
  isReady(): Observable<boolean> {
    return authState(this.auth).pipe(
      map(user => !!user)
    );
  }
}