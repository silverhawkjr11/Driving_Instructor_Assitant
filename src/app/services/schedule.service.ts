import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StudentService } from './student.service';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  studentId?: number;
  status: 'available' | 'booked' | 'break' | 'school-teaching';
}

export interface SchedulePreferences {
  workingDays: number[];  // 0-6 for Sunday-Saturday
  workingHours: {
    start: string;  // HH:mm format
    end: string;
  };
  schoolTeachingHours?: {
    day: number;
    start: string;
    end: string;
  }[];
  preferredBreaks?: {
    day: number;
    start: string;
    end: string;
  }[];
  lessonDuration: number;  // in minutes
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private studentService: StudentService) { }

  private preferences: SchedulePreferences = {
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    workingHours: {
      start: '08:00',
      end: '17:00'
    },
    lessonDuration: 45
  };

  generateWeeklySchedule(startDate: Date): TimeSlot[] {
    const schedule: TimeSlot[] = [];
    const students = this.studentService.getStudents();

    // Generate time slots for the week
    for (let day = 0; day < 7; day++) {
      if (!this.preferences.workingDays.includes(day)) continue;

      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      // Check if it's a school teaching day
      const schoolHours = this.preferences.schoolTeachingHours?.find(h => h.day === day);
      if (schoolHours) {
        schedule.push({
          startTime: this.createDateTime(currentDate, schoolHours.start),
          endTime: this.createDateTime(currentDate, schoolHours.end),
          status: 'school-teaching'
        });
        continue;
      }

      // Generate regular lesson slots
      let currentTime = this.createDateTime(currentDate, this.preferences.workingHours.start);
      const endTime = this.createDateTime(currentDate, this.preferences.workingHours.end);

      while (currentTime < endTime) {
        // Check for break times
        const breakTime = this.preferences.preferredBreaks?.find(b =>
          b.day === day && this.isTimeInRange(currentTime, b.start, b.end)
        );

        if (breakTime) {
          schedule.push({
            startTime: this.createDateTime(currentDate, breakTime.start),
            endTime: this.createDateTime(currentDate, breakTime.end),
            status: 'break'
          });
          currentTime = this.createDateTime(currentDate, breakTime.end);
          continue;
        }

        // Add regular lesson slot
        schedule.push({
          startTime: new Date(currentTime),
          endTime: new Date(currentTime.getTime() + this.preferences.lessonDuration * 60000),
          status: 'available'
        });

        currentTime.setMinutes(currentTime.getMinutes() + this.preferences.lessonDuration);
      }
    }

    return this.assignStudentsToSlots(schedule, students());
  }

  private assignStudentsToSlots(slots: TimeSlot[], students: any[]): TimeSlot[] {
    const prioritizedStudents = this.prioritizeStudents(students);

    return slots.map(slot => {
      if (slot.status !== 'available') return slot;

      const student = prioritizedStudents.shift();
      if (student) {
        return {
          ...slot,
          studentId: student.id,
          status: 'booked'
        };
      }
      return slot;
    });
  }

  private prioritizeStudents(students: any[]): any[] {
    return students.sort((a, b) => {
      const aLastLesson = new Date(a.lastLesson).getTime();
      const bLastLesson = new Date(b.lastLesson).getTime();
      return aLastLesson - bLastLesson;
    });
  }

  private createDateTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  private isTimeInRange(date: Date, startTime: string, endTime: string): boolean {
    const time = `${date.getHours()}:${date.getMinutes()}`;
    return time >= startTime && time < endTime;
  }

  updatePreferences(newPreferences: Partial<SchedulePreferences>) {
    this.preferences = { ...this.preferences, ...newPreferences };
  }
}
