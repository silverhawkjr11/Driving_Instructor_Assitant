import { Lesson } from "./lesson.model";

export interface Student {
  id?: string;
  name: string;
  phone: string; // Primary identifier - required and unique
  startDate: Date;
  status: 'active' | 'inactive';
  
  // Lesson tracking
  lessonsCompleted: number;
  lastLesson: Date | null;
  lessons: Lesson[];
  
  // Payment tracking
  balance: number; // Amount student owes (negative means they prepaid)
  paymentStatus: PaymentStatus;
  lastPaymentDate: Date | null;
  
  // Progress tracking
  progressNotes?: string; // Optional instructor notes about progress
  isReadyForTest: boolean; // Calculated: lessonsCompleted >= 30
  
  // Optional fields
  photo?: string; // Base64 or URL from government document
  
  // Metadata
  createdAt: Date;
  instructorId: string;
}

export enum PaymentStatus {
  PAID_UP = 'PAID_UP',           // No money owed
  OWES_MONEY = 'OWES_MONEY',     // Has outstanding balance
  OVERDUE = 'OVERDUE'            // Payment is significantly overdue
}

export interface Payment {
  id?: string;
  studentId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  notes?: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD'
}