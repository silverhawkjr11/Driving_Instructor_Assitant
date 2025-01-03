import { Lesson } from "./lesson.model";

export interface Student {
  id?: string;
  name: string;
  phone: string;
  startDate: Date;
  status: 'active' | 'inactive';
  lessonsCompleted: number;
  lastLesson: Date | null;
  lessons: Lesson[];
  balance: number;
  createdAt: Date;
  instructorId: string; // Add this line
 }