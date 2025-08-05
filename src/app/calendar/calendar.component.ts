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
import { TranslationService } from '../services/translation.service';
import { Student } from '../../models/student.model';
import { Lesson } from '../../models/lesson.model';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AddEventDialogComponent } from '../event-dialog/event-dialog.component';

// Import locales for FullCalendar
import heLocale from '@fullcalendar/core/locales/he';
import arLocale from '@fullcalendar/core/locales/ar';
import esLocale from '@fullcalendar/core/locales/es';
import frLocale from '@fullcalendar/core/locales/fr';

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
  private translationService = inject(TranslationService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  // Signals for reactive state
  currentDate = signal(new Date());
  selectedDate = signal(new Date());
  students = signal<Student[]>([]);
  lessons = signal<CalendarLesson[]>([]);
  
  // Computed values for translations
  currentLanguage = computed(() => this.translationService.currentLanguage$());
  
  // Student colors for consistent lesson display
  private studentColors = [
    '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', 
    '#303f9f', '#0097a7', '#689f38', '#f9a825',
    '#e64a19', '#5d4037', '#455a64', '#c2185b'
  ];

  // FullCalendar locale mapping
  private localeMap = {
    'en': null, // English is default
    'he': heLocale,
    'ar': arLocale,
    'es': esLocale,
    'fr': frLocale
  };

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
    // Dynamic button text based on current language
    buttonText: {
      today: this.t('today'),
      month: this.t('month'),
      week: this.t('week'),
      day: this.t('day')
    },
    locale: this.getCurrentLocale() || undefined,
    direction: this.translationService.isRTL() ? 'rtl' : 'ltr'
  };

  ngOnInit() {
    this.loadStudentsAndLessons();
    
    // Watch for language changes and update calendar using effect
    // Since currentLanguage$ is a computed signal, we'll use effect to watch changes
    // For now, we'll check for changes manually or use a different approach
    this.updateCalendarLocale(); // Initial setup
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Translation helper method
  t(key: string, params?: { [key: string]: string | number }): string {
    return this.translationService.translate(key, params);
  }

  private getCurrentLocale() {
    const langCode = this.translationService.getCurrentLanguageCode();
    return this.localeMap[langCode as keyof typeof this.localeMap] || null;
  }

  private updateCalendarLocale() {
    const newLocale = this.getCurrentLocale() || undefined;
    const isRTL = this.translationService.isRTL();
    
    this.calendarOptions = {
      ...this.calendarOptions,
      locale: newLocale,
      direction: isRTL ? 'rtl' : 'ltr',
      buttonText: {
        today: this.t('today'),
        month: this.t('month'),
        week: this.t('week'),
        day: this.t('day')
      }
    };
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
    
    // Check if startTime exists and is a valid string
    if (lesson.startTime && typeof lesson.startTime === 'string' && lesson.startTime.includes(':')) {
      try {
        const [hours, minutes] = lesson.startTime.split(':').map(Number);
        // Validate the parsed hours and minutes
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          lessonDate.setHours(hours, minutes, 0, 0);
        } else {
          // Fallback to default time if parsing fails
          console.warn(`Invalid time format for lesson ${lesson.id}: ${lesson.startTime}`);
          lessonDate.setHours(9, 0, 0, 0); // Default to 9:00 AM
        }
      } catch (error) {
        console.error(`Error parsing startTime for lesson ${lesson.id}:`, error);
        lessonDate.setHours(9, 0, 0, 0); // Default to 9:00 AM
      }
    } else {
      // Default time if startTime is not available or invalid
      console.warn(`Missing or invalid startTime for lesson ${lesson.id}:`, lesson.startTime);
      lessonDate.setHours(9, 0, 0, 0); // Default to 9:00 AM
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
    this.openEditLessonDialog(lesson, clickInfo.event);
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
      width: '500px',
      maxWidth: '90vw',
      data: {
        date: startTime || this.selectedDate(),
        hour: startTime ? startTime.getHours() : 9,
        students: this.students()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.delete) {
          this.handleLessonDeletion(result);
        } else {
          this.createLessonFromEvent(result);
        }
      }
    });
  }

  openEditLessonDialog(lesson: CalendarLesson, event?: any) {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        lesson: lesson,
        event: event,
        students: this.students()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.delete) {
          this.handleLessonDeletion(result);
        } else if (result.isEdit) {
          this.updateLessonFromDialog(result);
        }
      }
    });
  }

  private async handleLessonDeletion(result: any) {
    const lesson = result.lesson || result.event?.extendedProps?.lesson;
    if (!lesson) return;

    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete this lesson with ${lesson.studentName}?`);
    if (!confirmed) return;

    try {
      const student = this.students().find(s => s.name === lesson.studentName);
      if (!student) {
        alert('Student not found');
        return;
      }

      await this.studentService.deleteLesson(student.id!, lesson.id!);
      
      // Reload lessons
      this.loadAllLessons(this.students());
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  }

  private async updateLessonFromDialog(result: any) {
    try {
      const originalLesson = result.originalLesson || result.originalEvent?.extendedProps?.lesson;
      if (!originalLesson) return;

      const student = this.students().find(s => s.name === originalLesson.studentName);
      if (!student) {
        alert('Student not found');
        return;
      }

      const updates = {
        date: result.start,
        startTime: this.formatTimeFromDate(result.start),
        duration: result.duration,
        cost: result.cost,
        notes: result.notes
      };

      await this.studentService.updateLesson(student.id!, originalLesson.id!, updates);
      
      // Reload lessons
      this.loadAllLessons(this.students());
    } catch (error) {
      console.error('Error updating lesson:', error);
      alert('Failed to update lesson');
    }
  }

  private async createLessonFromEvent(eventData: any) {
    try {
      // Find student by name
      const studentName = eventData.studentName || eventData.title;
      const student = this.students().find(s => 
        s.name.toLowerCase() === studentName.toLowerCase()
      );
      
      if (!student) {
        alert('Student not found. Please select a valid student.');
        return;
      }

      const startDate = new Date(eventData.start);
      const endDate = new Date(eventData.end);
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
      const newLesson: Lesson = {
        date: startDate,
        startTime: this.formatTimeFromDate(startDate),
        duration: duration,
        cost: eventData.cost || 50,
        notes: eventData.notes || '',
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

  // Legacy method - can be removed
  private editLesson(lesson: CalendarLesson) {
    this.openEditLessonDialog(lesson);
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
      alert(this.t('failed_to_update_lesson'));
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
      alert(this.t('failed_to_update_lesson'));
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
      alert(this.t('failed_to_update_lesson'));
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