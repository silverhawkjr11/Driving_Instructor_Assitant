import { Lesson } from "../../models/lesson.model";

export interface Student {
  id?: string;
  name: string;
  phone: string;
  instructorId: string;
  startDate: Date;
  lastLesson?: Date;
  lessonsCompleted: number;
  status: 'active' | 'inactive';
  lessons: Lesson[];
  createdAt?: Date;
}
