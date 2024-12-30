import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from, map, switchMap } from 'rxjs';

export interface Student {
  id?: string;
  name: string;
  lastLesson: Date;
  createdAt: Date;
  lessons: Lesson[];
}

export interface Lesson {
  id?: string;
  date: Date;
  duration: number;
  notes: string;
}

export interface ScheduleEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  studentId?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) { }

  // Students Collection Operations
  getStudents(): Observable<Student[]> {
    return this.auth.user.pipe(
      switchMap(user => {
        if (!user) return [];
        return this.firestore
          .collection(`users/${user.uid}/students`, ref => ref.orderBy('createdAt', 'desc'))
          .snapshotChanges()
          .pipe(
            map(actions => actions.map(a => {
              const data = a.payload.doc.data() as Student;
              const id = a.payload.doc.id;
              return { id, ...data };
            }))
          );
      })
    );
  }

  addStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.auth.user.subscribe(user => {
        console.log('Current user:', user); // Check if we have a user
        if (!user) {
          reject(new Error('No authenticated user'));
          return;
        }

        const newStudent = {
          ...student,
          createdAt: new Date(),
          lessons: []
        };
        console.log('Attempting to add student:', newStudent); // Log the data we're trying to add
        console.log('Path:', `users/${user.uid}/students`); // Log the path

        this.firestore
          .collection(`users/${user.uid}/students`)
          .add(newStudent)
          .then(() => {
            console.log('Student added successfully');
            resolve();
          })
          .catch(error => {
            console.error('Error adding student:', error);
            reject(error);
          });
      });
    });
  }
  // Lessons Operations
  addLesson(studentId: string, lesson: Omit<Lesson, 'id'>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.auth.user.subscribe(user => {
        if (!user) {
          reject(new Error('No authenticated user'));
          return;
        }

        const studentRef = this.firestore.doc(`users/${user.uid}/students/${studentId}`);

        studentRef.get().subscribe(doc => {
          if (doc.exists) {
            const currentLessons = (doc.data() as Student).lessons || [];
            const newLesson = { ...lesson, id: this.firestore.createId() };

            studentRef.update({
              lessons: [...currentLessons, newLesson],
              lastLesson: lesson.date
            })
              .then(() => resolve())
              .catch(error => reject(error));
          } else {
            reject(new Error('Student not found'));
          }
        });
      });
    });
  }
  private convertTimestampToDate(timestamp: any): Date {
    if (timestamp) {
      return timestamp.toDate();
    }
    return timestamp;
  }
  // Schedule Operations
  getSchedule(): Observable<ScheduleEvent[]> {
    return this.auth.user.pipe(
      switchMap(user => {
        if (!user) return [];
        return this.firestore
          .collection(`users/${user.uid}/schedule`)
          .snapshotChanges()
          .pipe(
            map(actions => actions.map(a => {
              const data = a.payload.doc.data() as any;
              const id = a.payload.doc.id;

              // Convert timestamps to dates
              return {
                id,
                title: data.title,
                start: this.convertTimestampToDate(data.start),
                end: this.convertTimestampToDate(data.end),
                studentId: data.studentId,
                color: data.color
              } as ScheduleEvent;
            }))
          );
      })
    );
  }
  addScheduleEvent(event: Omit<ScheduleEvent, 'id'>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.auth.user.subscribe(user => {
        if (!user) {
          reject(new Error('No authenticated user'));
          return;
        }

        this.firestore
          .collection(`users/${user.uid}/schedule`)
          .add(event)
          .then(() => resolve())
          .catch(error => reject(error));
      });
    });
  }

  updateScheduleEvent(eventId: string, event: Partial<ScheduleEvent>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.auth.user.subscribe(user => {
        if (!user) {
          reject(new Error('No authenticated user'));
          return;
        }

        this.firestore
          .doc(`users/${user.uid}/schedule/${eventId}`)
          .update(event)
          .then(() => resolve())
          .catch(error => reject(error));
      });
    });
  }

  deleteScheduleEvent(eventId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.auth.user.subscribe(user => {
        if (!user) {
          reject(new Error('No authenticated user'));
          return;
        }

        this.firestore
          .doc(`users/${user.uid}/schedule/${eventId}`)
          .delete()
          .then(() => resolve())
          .catch(error => reject(error));
      });
    });
  }
}
