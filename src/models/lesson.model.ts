export interface Lesson {
  id?: string;
  date: Date;
  startTime: string; // Format: "HH:MM" (24-hour format)
  duration: number; // in minutes
  cost: number;
  notes?: string;
  isPaid: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}