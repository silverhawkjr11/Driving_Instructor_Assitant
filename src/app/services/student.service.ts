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
import { Observable } from 'rxjs';
import { Student } from '../../models/student.model';
import { Lesson } from '../../models/lesson.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private studentsCollection = collection(this.firestore, 'students');

  getStudents(): Observable<Student[]> {
    const user = this.auth.currentUser;
    if (!user) return new Observable<Student[]>();

    const q = query(
      this.studentsCollection,
      where('instructorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<Student[]>;
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