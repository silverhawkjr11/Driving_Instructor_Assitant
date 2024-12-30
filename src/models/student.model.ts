export interface Student {
lessons: any;
lastLesson: any;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  instructorId: string; // References the authenticated instructor
  startDate: Date;
  lessonsCompleted: number;
  nextLesson?: Date;
  notes?: string;
  status: 'active' | 'completed' | 'inactive';
  // Add any other fields you need
}
