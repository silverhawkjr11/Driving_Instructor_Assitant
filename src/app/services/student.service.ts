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
  increment
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { map, Observable } from 'rxjs';
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
    return new Observable<Student[]>((subscriber) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          const q = query(
            this.studentsCollection,
            where('instructorId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
  
          collectionData(q, { idField: 'id' })
            .pipe(
              // Map the data to the Student type
              map((data) =>
                data.map((doc) => ({
                  id: doc['id'],
                  name: doc['name'] || '',
                  phone: doc['phone'] || '',
                  startDate: doc['startDate'] || new Date(),
                  status: doc['status'] || 'active',
                  lessonsCompleted: doc['lessonsCompleted'] || 0,
                  lastLesson: doc['lastLesson'] || null,
                  lessons: doc['lessons'] || [],
                  instructorId: doc['instructorId'],
                  createdAt: doc['createdAt'] || new Date(),
                })) as unknown as Student[]
              )
            )
            .subscribe({
              next: (data) => subscriber.next(data),
              error: (error) => subscriber.error(error),
            });
        } else {
          subscriber.next([]);
        }
      });
    });
  }
    
  async addStudent(studentData: Partial<Student>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const newStudent = {
      ...studentData,
      instructorId: user.uid,
      createdAt: new Date(),
      lessons: []
    };

    try {
      await addDoc(this.studentsCollection, newStudent);
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  }

  async addLesson(studentId: string, lessonData: Lesson): Promise<void> {
    try {
      const studentRef = doc(this.firestore, 'students', studentId);
      await updateDoc(studentRef, {
        lessons: arrayUnion(lessonData),
        lastLesson: lessonData.date,
        lessonsCompleted: increment(1)
      });
    } catch (error) {
      console.error('Error adding lesson:', error);
      throw error;
    }
  }
}