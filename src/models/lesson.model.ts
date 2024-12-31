export interface Lesson {
  id?: string;
  date: Date;
  duration: number;
  notes: string;
  payment: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}