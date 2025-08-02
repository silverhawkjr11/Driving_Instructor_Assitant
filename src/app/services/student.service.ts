import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
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
import { 
  first, 
  from, 
  map, 
  Observable, 
  of, 
  switchMap, 
  filter, 
  startWith, 
  catchError, 
  combineLatest 
} from 'rxjs';
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
    console.log('StudentService: getStudents() called'); // Debug log
    
    // Wait for authentication state and handle both authenticated and non-authenticated states
    return authState(this.auth).pipe(
      startWith(this.auth.currentUser), // Start with current user if already authenticated
      switchMap(user => {
        console.log('Auth state changed, user:', user?.uid); // Debug log
        
        if (!user?.uid) {
          console.log('No authenticated user, returning empty array');
          return of([]); // Return empty array if no user
        }
        
        try {
          const studentsRef = collection(this.firestore, 'students');
          const q = query(studentsRef, where('instructorId', '==', user.uid));
          
          return collectionData(q, { idField: 'id' }).pipe(
            map(students => {
              console.log('Raw students from Firestore:', students); // Debug log
              
              return students.map(student => ({
                ...student,
                // Convert Firestore Timestamps to Dates
                startDate: student['startDate'] instanceof Timestamp ? 
                  student['startDate'].toDate() : 
                  student['startDate'] ? new Date(student['startDate']) : new Date(),
                lastLesson: student['lastLesson'] instanceof Timestamp ? 
                  student['lastLesson'].toDate() : 
                  student['lastLesson'] ? new Date(student['lastLesson']) : null,
                lastPaymentDate: student['lastPaymentDate'] instanceof Timestamp ? 
                  student['lastPaymentDate'].toDate() : 
                  student['lastPaymentDate'] ? new Date(student['lastPaymentDate']) : null,
                createdAt: student['createdAt'] instanceof Timestamp ? 
                  student['createdAt'].toDate() : 
                  student['createdAt'] ? new Date(student['createdAt']) : new Date(),
                // Ensure required fields have default values
                lessonsCompleted: student['lessonsCompleted'] || 0,
                balance: student['balance'] || 0,
                paymentStatus: student['paymentStatus'] || 'PAID_UP',
                progressNotes: student['progressNotes'] || '',
                isReadyForTest: student['isReadyForTest'] || false,
                lessons: student['lessons'] || []
              }) as Student);
            }),
            catchError(error => {
              console.error('Error in students query:', error);
              return of([]);
            })
          );
        } catch (error) {
          console.error('Error setting up students query:', error);
          return of([]);
        }
      }),
      catchError(error => {
        console.error('Error in authState switchMap:', error);
        return of([]);
      })
    );
  }

  getStudentLessons(studentId: string): Observable<Lesson[]> {
    if (!studentId) {
      console.log('No studentId provided, returning empty array');
      return of([]); // Return empty array for invalid studentId
    }

    try {
      const lessonsRef = collection(this.firestore, `students/${studentId}/lessons`);
      const q = query(lessonsRef, orderBy('date', 'desc'));

      return collectionData(q, { idField: 'id' }).pipe(
        map(lessons => {
          console.log(`Lessons for student ${studentId}:`, lessons); // Debug log
          
          return lessons.map(lesson => ({
            ...lesson,
            date: lesson['date'] instanceof Timestamp ?
              lesson['date'].toDate() :
              new Date(lesson['date']), // Ensure it's always a Date object
            createdAt: lesson['createdAt'] instanceof Timestamp ?
              lesson['createdAt'].toDate() :
              lesson['createdAt'] ? new Date(lesson['createdAt']) : new Date(),
            // Ensure required fields have default values
            startTime: lesson['startTime'] || '', // Handle startTime field
            duration: lesson['duration'] || 0,
            cost: lesson['cost'] || 0,
            notes: lesson['notes'] || '',
            isPaid: lesson['isPaid'] || false,
            status: lesson['status'] || 'completed'
          }) as Lesson);
        }),
        catchError(error => {
          console.error(`Error loading lessons for student ${studentId}:`, error);
          return of([]);
        })
      );
    } catch (error) {
      console.error(`Error setting up lessons query for student ${studentId}:`, error);
      return of([]);
    }
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
      startTime: lesson.startTime, // Save the start time string
      createdAt: serverTimestamp()
    });
  }

  async updateLesson(studentId: string, lessonId: string, updates: Partial<Lesson>): Promise<void> {
    if (!studentId || !lessonId) {
      throw new Error('Student ID and Lesson ID are required for update');
    }

    const lessonRef = doc(this.firestore, `students/${studentId}/lessons`, lessonId);

    // Convert Date objects to Timestamps for Firestore
    const firestoreUpdates: any = { ...updates };

    if (updates.date && updates.date instanceof Date) {
      firestoreUpdates.date = Timestamp.fromDate(updates.date);
    }

    if (updates.createdAt && updates.createdAt instanceof Date) {
      firestoreUpdates.createdAt = Timestamp.fromDate(updates.createdAt);
    }

    await updateDoc(lessonRef, firestoreUpdates);
  }

  async deleteLesson(studentId: string, lessonId: string): Promise<void> {
    if (!studentId || !lessonId) {
      throw new Error('Student ID and Lesson ID are required for deletion');
    }

    const lessonRef = doc(this.firestore, `students/${studentId}/lessons`, lessonId);
    await deleteDoc(lessonRef);
  }

  getLessonById(studentId: string, lessonId: string): Observable<Lesson | undefined> {
    if (!studentId || !lessonId) {
      return of(undefined);
    }

    const lessonRef = doc(this.firestore, `students/${studentId}/lessons`, lessonId);
    return docData(lessonRef, { idField: 'id' }).pipe(
      map((lesson: any) => {
        if (!lesson) return undefined;
        
        return {
          ...lesson,
          date: lesson['date'] instanceof Timestamp ? 
            lesson['date'].toDate() : 
            new Date(lesson['date']),
          createdAt: lesson['createdAt'] instanceof Timestamp ? 
            lesson['createdAt'].toDate() : 
            lesson['createdAt'] ? new Date(lesson['createdAt']) : new Date(),
          // Ensure required fields have default values
          startTime: lesson['startTime'] || '',
          duration: lesson['duration'] || 0,
          cost: lesson['cost'] || 0,
          notes: lesson['notes'] || '',
          isPaid: lesson['isPaid'] || false,
          status: lesson['status'] || 'completed'
        } as Lesson;
      }),
      catchError(error => {
        console.error(`Error loading lesson ${lessonId}:`, error);
        return of(undefined);
      })
    );
  }

  // Helper method to get lessons for a specific date range
  getLessonsInDateRange(studentId: string, startDate: Date, endDate: Date): Observable<Lesson[]> {
    if (!studentId) {
      return of([]);
    }

    try {
      const lessonsRef = collection(this.firestore, `students/${studentId}/lessons`);
      const q = query(
        lessonsRef, 
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );

      return collectionData(q, { idField: 'id' }).pipe(
        map(lessons => {
          return lessons.map(lesson => ({
            ...lesson,
            date: lesson['date'] instanceof Timestamp ?
              lesson['date'].toDate() :
              new Date(lesson['date']),
            createdAt: lesson['createdAt'] instanceof Timestamp ?
              lesson['createdAt'].toDate() :
              lesson['createdAt'] ? new Date(lesson['createdAt']) : new Date(),
            startTime: lesson['startTime'] || '',
            duration: lesson['duration'] || 0,
            cost: lesson['cost'] || 0,
            notes: lesson['notes'] || '',
            isPaid: lesson['isPaid'] || false,
            status: lesson['status'] || 'completed'
          }) as Lesson);
        }),
        catchError(error => {
          console.error(`Error loading lessons in date range for student ${studentId}:`, error);
          return of([]);
        })
      );
    } catch (error) {
      console.error(`Error setting up date range query for student ${studentId}:`, error);
      return of([]);
    }
  }

  // Method to get all lessons across all students for calendar view
  getAllLessonsInDateRange(startDate: Date, endDate: Date): Observable<{lesson: Lesson, studentName: string, studentId: string}[]> {
    return this.getStudents().pipe(
      switchMap(students => {
        if (!students.length) {
          return of([]);
        }

        const lessonObservables = students.map(student => 
          this.getLessonsInDateRange(student.id!, startDate, endDate).pipe(
            map(lessons => lessons.map(lesson => ({
              lesson,
              studentName: student.name,
              studentId: student.id!
            })))
          )
        );

        return combineLatest(lessonObservables).pipe(
          map(lessonArrays => lessonArrays.flat())
        );
      })
    );
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
      }),
      catchError(error => {
        console.error(`Error loading student ${studentId}:`, error);
        return of(undefined);
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