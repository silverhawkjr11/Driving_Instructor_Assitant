import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, combineLatest, map } from 'rxjs';
import { StudentService } from '../services/student.service';
import { Student } from '../../models/student.model';
import { Lesson } from '../../models/lesson.model';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AddEventDialogComponent } from '../event-dialog/event-dialog.component';

export type CalendarView = 'day' | 'week' | 'month';

interface CalendarLesson extends Lesson {
  studentName: string;
  color: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    studentId: string;
    studentName: string;
    lesson: CalendarLesson;
  };
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    FullCalendarModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private studentService = inject(StudentService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  // Signals for reactive state
  currentDate = signal(new Date());
  selectedDate = signal(new Date());
  students = signal<Student[]>([]);
  lessons = signal<CalendarLesson[]>([]);
  
  // Student colors for consistent lesson display
  private studentColors = [
    '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', 
    '#303f9f', '#0097a7', '#689f38', '#f9a825',
    '#e64a19', '#5d4037', '#455a64', '#c2185b'
  ];

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    height: 'auto',
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:15:00',
    snapDuration: '00:15:00',
    allDaySlot: false,
    nowIndicator: true,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '08:00',
      endTime: '18:00'
    },
    events: [],
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventChange: this.handleEventChange.bind(this),
  };

  ngOnInit() {
    this.loadStudentsAndLessons();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStudentsAndLessons() {
    this.studentService.getStudents().pipe(
      takeUntil(this.destroy$)
    ).subscribe(students => {
      this.students.set(students);
      this.loadAllLessons(students);
    });
  }

  private loadAllLessons(students: Student[]) {
    if (!students.length) {
      this.lessons.set([]);
      this.updateCalendarEvents([]);
      return;
    }

    // Create observables for each student's lessons
    const lessonObservables = students.map(student => 
      this.studentService.getStudentLessons(student.id!).pipe(
        map(lessons => lessons.map(lesson => ({
          ...lesson,
          studentName: student.name,
          color: this.getStudentColor(student.id!)
        } as CalendarLesson)))
      )
    );

    // Combine all lesson observables
    combineLatest(lessonObservables).pipe(
      takeUntil(this.destroy$)
    ).subscribe(lessonArrays => {
      const allLessons = lessonArrays.flat();
      this.lessons.set(allLessons);
      this.updateCalendarEvents(allLessons);
    });
  }

  private updateCalendarEvents(lessons: CalendarLesson[]) {
    const events: CalendarEvent[] = lessons.map(lesson => {
      const startDateTime = this.createLessonDateTime(lesson);
      const endDateTime = new Date(startDateTime.getTime() + lesson.duration * 60000);

      return {
        id: `${lesson.id}-${lesson.studentName}`,
        title: lesson.studentName,
        start: startDateTime,
        end: endDateTime,
        backgroundColor: lesson.color,
        borderColor: lesson.color,
        textColor: '#ffffff',
        extendedProps: {
          studentId: this.getStudentIdByName(lesson.studentName),
          studentName: lesson.studentName,
          lesson: lesson
        }
      };
    });

    // Update calendar options with new events
    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  private createLessonDateTime(lesson: CalendarLesson): Date {
    const lessonDate = new Date(lesson.date);
    if (lesson.startTime) {
      const [hours, minutes] = lesson.startTime.split(':').map(Number);
      lessonDate.setHours(hours, minutes, 0, 0);
    }
    return lessonDate;
  }

  private getStudentColor(studentId: string): string {
    const hash = studentId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return this.studentColors[Math.abs(hash) % this.studentColors.length];
  }

  private getStudentIdByName(studentName: string): string {
    const student = this.students().find(s => s.name === studentName);
    return student?.id || '';
  }

  // FullCalendar event handlers
  handleDateSelect(selectInfo: DateSelectArg) {
    this.openAddLessonDialog(selectInfo.start);
  }

  handleEventClick(clickInfo: EventClickArg) {
    const lesson = clickInfo.event.extendedProps['lesson'] as CalendarLesson;
    this.editLesson(lesson);
  }

  handleEventDrop(dropInfo: EventDropArg) {
    const lesson = dropInfo.event.extendedProps['lesson'] as CalendarLesson;
    const newDate = dropInfo.event.start!;
    const newStartTime = this.formatTimeFromDate(newDate);
    
    this.updateLesson(lesson, newDate, newStartTime);
  }

  handleEventChange(changeInfo: any) {
    // Handle any other event changes if needed
    console.log('Event changed:', changeInfo);
  }

  private formatTimeFromDate(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  // Dialog Methods
  openAddLessonDialog(startTime?: Date) {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '400px',
      data: {
        date: startTime || this.selectedDate(),
        hour: startTime ? startTime.getHours() : 9,
        students: this.students()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createLessonFromEvent(result);
      }
    });
  }

  private async createLessonFromEvent(eventData: any) {
    try {
      // Find student by name (you might want to modify the dialog to return student ID)
      const studentName = eventData.title;
      const student = this.students().find(s => 
        s.name.toLowerCase().includes(studentName.toLowerCase())
      );
      
      if (!student) {
        alert('Student not found');
        return;
      }

      const startDate = new Date(eventData.start);
      const endDate = new Date(eventData.end);
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

      const newLesson: Lesson = {
        date: startDate,
        startTime: this.formatTimeFromDate(startDate),
        duration: duration,
        cost: 50, // default cost
        notes: '',
        isPaid: false,
        status: 'scheduled',
        createdAt: new Date()
      };
      
      await this.studentService.addLesson(student.id!, newLesson);
      
      // Reload lessons to get the updated list
      this.loadAllLessons(this.students());
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Failed to create lesson');
    }
  }

  private editLesson(lesson: CalendarLesson) {
    // Open edit dialog - for now use prompts
    const newNotes = prompt('Lesson notes:', lesson.notes || '');
    if (newNotes !== null) {
      this.updateLessonNotes(lesson, newNotes);
    }
  }

  private async updateLesson(lesson: CalendarLesson, newDate: Date, newStartTime: string) {
    try {
      const student = this.students().find(s => s.name === lesson.studentName);
      if (!student) return;
      
      // Update lesson in Firebase
      await this.studentService.updateLesson(student.id!, lesson.id!, {
        date: newDate,
        startTime: newStartTime
      });
      
      // Reload lessons
      this.loadAllLessons(this.students());
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  }

  private async updateLessonDuration(lesson: CalendarLesson, newDuration: number) {
    try {
      const student = this.students().find(s => s.name === lesson.studentName);
      if (!student) return;
      
      await this.studentService.updateLesson(student.id!, lesson.id!, {
        duration: newDuration
      });

      // Reload lessons
      this.loadAllLessons(this.students());
    } catch (error) {
      console.error('Error updating lesson duration:', error);
    }
  }

  private async updateLessonNotes(lesson: CalendarLesson, notes: string) {
    try {
      const student = this.students().find(s => s.name === lesson.studentName);
      if (!student) return;
      
      await this.studentService.updateLesson(student.id!, lesson.id!, {
        notes
      });
      
      // Update local state
      const updatedLessons = this.lessons().map(l =>
        l.id === lesson.id ? { ...l, notes } : l
      );
      this.lessons.set(updatedLessons);
      this.updateCalendarEvents(updatedLessons);
    } catch (error) {
      console.error('Error updating lesson notes:', error);
    }
  }

  // Utility Methods
  private parseTimeString(timeString: string): [number, number] {
    const [hours, minutes] = timeString.split(':').map(Number);
    return [hours || 0, minutes || 0];
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}