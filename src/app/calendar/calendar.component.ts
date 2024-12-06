// calendar.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddEventDialogComponent } from '../event-dialog/event-dialog.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';
export type CalendarViewType = 'day' | '3day' | 'week' | 'month';
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,  // Add this line
    MatTooltip
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  private dialog = inject(MatDialog);

  currentDate: Date;
  currentView: CalendarViewType = 'week';
  days: Date[] = [];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  events: CalendarEvent[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor() {
    this.currentDate = new Date();
    this.updateDays();
  }

  ngOnInit() {
    // Sample events
    this.events = [
      {
        id: 1,
        title: 'Team Meeting',
        start: new Date(2024, 11, 6, 10, 0),
        end: new Date(2024, 11, 6, 11, 30),
        color: '#1976d2'
      },
      {
        id: 2,
        title: 'Lunch Break',
        start: new Date(2024, 11, 6, 12, 0),
        end: new Date(2024, 11, 6, 13, 0),
        color: '#388e3c'
      }
    ];
  }

  // View management
  onViewChange(view: CalendarViewType) {
    this.currentView = view;
    this.updateDays();
  }

  getVisibleDays(): Date[] {
    switch (this.currentView) {
      case 'day':
        return [this.currentDate];
      case '3day':
        return this.days.slice(0, 3);
      case 'week':
        return this.days;
      default:
        return this.days;
    }
  }

  getViewTitle(): string {
    const monthYear = this.currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    if (this.currentView === 'month') {
      return monthYear;
    }

    const visibleDays = this.getVisibleDays();
    const start = visibleDays[0].toLocaleDateString('default', { month: 'short', day: 'numeric' });
    const end = visibleDays[visibleDays.length - 1].toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  }

  // Navigation
  navigate(direction: 'prev' | 'next') {
    const amount = this.currentView === 'month' ? 1 :
      this.currentView === 'week' ? 7 :
        this.currentView === '3day' ? 3 : 1;

    const days = direction === 'prev' ? -amount : amount;
    this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + days));
    this.updateDays();
  }

  goToToday() {
    this.currentDate = new Date();
    this.updateDays();
  }

  // Event handling
  getVisibleEvents(): CalendarEvent[] {
    const visibleDays = this.getVisibleDays();
    const start = visibleDays[0];
    const end = visibleDays[visibleDays.length - 1];

    return this.events.filter(event => {
      return event.start >= start && event.start <= end;
    });
  }

  getEventWidth(): number {
    switch (this.currentView) {
      case 'day':
        return 95;
      case '3day':
        return 31;
      case 'week':
        return 13.5;
      default:
        return 13.5;
    }
  }

  getEventLeft(event: CalendarEvent): number {
    const dayIndex = this.getVisibleDays().findIndex(day =>
      this.isSameDay(day, event.start)
    );

    switch (this.currentView) {
      case 'day':
        return 2;
      case '3day':
        return dayIndex * 33 + 1;
      case 'week':
        return dayIndex * 14.285;
      default:
        return dayIndex * 14.285;
    }
  }

  // Month view specific methods
  isMonthView(): boolean {
    return this.currentView === 'month';
  }

  getMonthWeeks(): Date[][] {
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Add days from previous month
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

    // Add days from next month
    while (currentWeek.length < 7) {
      const day = new Date(currentWeek[currentWeek.length - 1]);
      day.setDate(day.getDate() + 1);
      currentWeek.push(day);
    }
    weeks.push(currentWeek);

    return weeks;
  }

  getEventsForDay(day: Date): CalendarEvent[] {
    return this.events.filter(event => this.isSameDay(event.start, day));
  }

  // Utility methods
  updateDays() {
    if (this.currentView === 'month') {
      return;
    }

    const numDays = this.currentView === 'week' ? 7 :
      this.currentView === '3day' ? 3 : 1;

    const startDate = new Date(this.currentDate);
    if (this.currentView === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
    }

    this.days = Array.from({ length: numDays }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      return day;
    });
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth();
  }

  isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  // Event methods remain the same as before
  getEventTop(event: CalendarEvent): number {
    const hours = event.start.getHours();
    const minutes = event.start.getMinutes();
    return hours * 60 + minutes;
  }

  getEventHeight(event: CalendarEvent): number {
    const diff = event.end.getTime() - event.start.getTime();
    return Math.max(30, diff / (1000 * 60));
  }

  openAddEventDialog(day?: Date, hour?: number) {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '400px',
      data: {
        date: day || new Date(),
        hour: hour || new Date().getHours()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.events.push({
          id: this.events.length + 1,
          ...result
        });
      }
    });
  }

  onDayClick(day: Date) {
    this.currentDate = new Date(day);
    this.currentView = 'day';
    this.updateDays();
  }

  editEvent(event: CalendarEvent) {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '400px',
      data: { event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.events.findIndex(e => e.id === event.id);
        if (index !== -1) {
          this.events[index] = { ...event, ...result };
        }
      }
    });
  }
}
