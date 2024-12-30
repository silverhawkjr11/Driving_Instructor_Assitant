export interface Lesson {
  id?: string;
  studentId?: string;
  instructorId?: string;
  date: Date;
  duration: number;
  topics?: string[];
  notes: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}
