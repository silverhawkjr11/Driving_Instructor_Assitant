export interface Lesson {
  id?: string;
  date: Date;
  duration: number; // Duration in minutes
  notes: string;
  cost: number; // Cost of this lesson
  isPaid: boolean; // Whether this lesson has been paid for
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: Date;
}