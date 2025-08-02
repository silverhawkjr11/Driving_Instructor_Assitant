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
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Subject, takeUntil, combineLatest, map } from 'rxjs';
import { StudentService } from '../services/student.service';
import { Student } from '../../models/student.model';
import { Lesson } from '../../models/lesson.model';

export type CalendarView = 'day' | 'week' | 'month';

interface CalendarLesson extends Lesson {
  studentName: string;
  color: string;
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
    DragDropModule
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
  currentView = signal<CalendarView>('week');
  students = signal<Student[]>([]);
  lessons = signal<CalendarLesson[]>([]);
  
  // Computed values
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Student colors for consistent lesson display
  private studentColors = [
    '#1976d2', '#388e3c', '#f57c00', '#7b1fa2', 
    '#303f9f', '#0097a7', '#689f38', '#f9a825',
    '#e64a19', '#5d4037', '#455a64', '#c2185b'
  ];

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
    });
  }

  private getStudentColor(studentId: string): string {
    const hash = studentId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return this.studentColors[Math.abs(hash) % this.studentColors.length];
  }

  // View Management
  onViewChange(view: CalendarView) {
    this.currentView.set(view);
  }

  getViewTitle(): string {
    const date = this.currentDate();
    const view = this.currentView();
    
    if (view === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    const visibleDays = this.getVisibleDays();
    if (view === 'day') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    // Week view
    const start = visibleDays[0];
    const end = visibleDays[visibleDays.length - 1];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }

  navigate(direction: 'prev' | 'next') {
    const current = new Date(this.currentDate());
    const view = this.currentView();
    
    switch (view) {
      case 'day':
        current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        current.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    this.currentDate.set(current);
  }

  goToToday() {
    this.currentDate.set(new Date());
    this.selectedDate.set(new Date());
  }

  isCurrentPeriodToday(): boolean {
    const today = new Date();
    const current = this.currentDate();
    const view = this.currentView();
    
    if (view === 'day') {
      return this.isSameDay(today, current);
    } else if (view === 'week') {
      const visibleDays = this.getVisibleDays();
      return visibleDays.some(day => this.isSameDay(day, today));
    } else {
      return today.getMonth() === current.getMonth() && today.getFullYear() === current.getFullYear();
    }
  }

  // Day/Week View Methods
  getVisibleDays(): Date[] {
    const view = this.currentView();
    const current = this.currentDate();
    
    if (view === 'day') {
      return [new Date(current)];
    }
    
    // Week view
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - current.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }

  getDisplayHours(): number[] {
    return Array.from({ length: 24 }, (_, i) => i);
  }

  formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  }

  onTimeSlotClick(day: Date, hour: number) {
    const startTime = new Date(day);
    startTime.setHours(hour, 0, 0, 0);
    this.openAddLessonDialog(startTime);
  }

  isCurrentHour(day: Date, hour: number): boolean {
    const now = new Date();
    return this.isSameDay(day, now) && now.getHours() === hour;
  }

  // Month View Methods
  getMonthWeeks(): Date[][] {
    const current = this.currentDate();
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
    const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek; i > 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - i);
      currentWeek.push(day);
    }
    
    // Add days of current month
    for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(day));
    }
    
    // Add days from next month to fill the last week
    while (currentWeek.length < 7) {
      const day = new Date(currentWeek[currentWeek.length - 1]);
      day.setDate(day.getDate() + 1);
      currentWeek.push(day);
    }
    weeks.push(currentWeek);
    
    return weeks;
  }

  onDayClick(day: Date) {
    this.selectedDate.set(new Date(day));
    this.currentDate.set(new Date(day));
    this.currentView.set('day');
  }

  onMiniCalendarChange(date: Date | null) {
    if (!date) {
      return;
    }
    this.currentDate.set(new Date(date));
    this.selectedDate.set(new Date(date));
  }

  // Lesson Methods
  getVisibleLessons(): CalendarLesson[] {
    const visibleDays = this.getVisibleDays();
    const view = this.currentView();
    
    if (view === 'month') {
      const weeks = this.getMonthWeeks();
      const allVisibleDays = weeks.flat();
      return this.lessons().filter(lesson => 
        allVisibleDays.some(day => this.isSameDay(day, lesson.date))
      );
    }
    
    return this.lessons().filter(lesson => 
      visibleDays.some(day => this.isSameDay(day, lesson.date))
    );
  }

  getLessonsForDay(day: Date): CalendarLesson[] {
    return this.lessons().filter(lesson => this.isSameDay(lesson.date, day));
  }

  getLessonTop(lesson: CalendarLesson): number {
    const startTime = this.parseTimeString(lesson.startTime);
    const [hours, minutes] = startTime;
    return hours * 60 + minutes; // 60px per hour
  }

  getLessonLeft(lesson: CalendarLesson): number {
    const visibleDays = this.getVisibleDays();
    const dayIndex = visibleDays.findIndex(day => this.isSameDay(day, lesson.date));
    
    if (dayIndex === -1) return 0;
    
    const view = this.currentView();
    if (view === 'day') return 2;
    
    return (dayIndex * (100 / visibleDays.length)) + 1;
  }

  getLessonWidth(): number {
    const view = this.currentView();
    const visibleDays = this.getVisibleDays();
    
    if (view === 'day') return 96;
    
    return (100 / visibleDays.length) - 2;
  }

  getLessonHeight(lesson: CalendarLesson): number {
    return Math.max(30, lesson.duration); // minimum 30px height
  }

  getLessonTimeString(lesson: CalendarLesson): string {
    if (!lesson.startTime) return '';
    
    const startTime = this.parseTimeString(lesson.startTime);
    const [hours, minutes] = startTime;
    
    // Calculate end time
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + lesson.duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    const formatTime = (h: number, m: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
    };
    
    return `${formatTime(hours, minutes)} - ${formatTime(endHours, endMins)}`;
  }

  getLessonTooltip(lesson: CalendarLesson): string {
    return `${lesson.studentName}\n${this.getLessonTimeString(lesson)}\nDuration: ${lesson.duration} minutes${lesson.notes ? `\nNotes: ${lesson.notes}` : ''}`;
  }

  onLessonClick(lesson: CalendarLesson, event: Event) {
    event.stopPropagation();
    this.editLesson(lesson);
  }

  // Drag and Drop
  onLessonDragEnd(event: CdkDragEnd, lesson: CalendarLesson) {
    const element = event.source.element.nativeElement;
    const rect = element.getBoundingClientRect();
    const container = document.querySelector('.time-grid')?.getBoundingClientRect();
    
    if (!container) return;
    
    // Calculate new time
    const minutesFromTop = Math.round((rect.top - container.top) / 60) * 60;
    const newHour = Math.floor(minutesFromTop / 60);
    const newMinutes = minutesFromTop % 60;
    
    // Calculate new day
    const dayWidth = container.width / this.getVisibleDays().length;
    const dayIndex = Math.floor((rect.left - container.left) / dayWidth);
    const newDay = this.getVisibleDays()[dayIndex];
    
    if (!newDay || newHour < 0 || newHour > 23) {
      event.source.reset();
      return;
    }
    
    // Update lesson
    const newDate = new Date(newDay);
    const newStartTime = `${newHour.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    
    this.updateLesson(lesson, newDate, newStartTime);
    event.source.reset();
  }

  startResize(event: MouseEvent, lesson: CalendarLesson) {
    event.preventDefault();
    event.stopPropagation();
    
    const startY = event.clientY;
    const originalDuration = lesson.duration;
    
    const onMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newDuration = Math.max(15, originalDuration + deltaY); // minimum 15 minutes
      
      // Update lesson duration temporarily for visual feedback
      const updatedLessons = this.lessons().map(l => 
        l.id === lesson.id ? { ...l, duration: newDuration } : l
      );
      this.lessons.set(updatedLessons);
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Save the final duration
      this.updateLessonDuration(lesson);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // Dialog Methods
  openAddLessonDialog(startTime?: Date) {
    // Import and open lesson dialog - you'll need to create this component
    // For now, we'll use a simple prompt
    const studentName = prompt('Student name:');
    if (!studentName) return;
    
    const student = this.students().find(s => 
      s.name.toLowerCase().includes(studentName.toLowerCase())
    );
    
    if (!student) {
      alert('Student not found');
      return;
    }
    
    const date = startTime || this.selectedDate();
    const time = startTime ? 
      `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}` :
      '09:00';
    
    this.createLesson(student, date, time);
  }

  private async createLesson(student: Student, date: Date, startTime: string) {
    try {
      const newLesson: Lesson = {
        date,
        startTime,
        duration: 45, // default duration
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
      // Update lesson notes
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

  private async updateLessonDuration(lesson: CalendarLesson) {
    try {
      const student = this.students().find(s => s.name === lesson.studentName);
      if (!student) return;
      
      await this.studentService.updateLesson(student.id!, lesson.id!, {
        duration: lesson.duration
      });
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

  isSameMonth(date: Date): boolean {
    const current = this.currentDate();
    return date.getMonth() === current.getMonth() &&
           date.getFullYear() === current.getFullYear();
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  isSelected(date: Date): boolean {
    return this.isSameDay(date, this.selectedDate());
  }

  dateFilter = (date: Date | null): boolean => {
    // You can add custom date filtering logic here
    return true;
  };
}