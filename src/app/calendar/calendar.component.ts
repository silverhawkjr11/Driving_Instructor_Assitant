// calendar.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AddEventDialogComponent } from '../event-dialog/event-dialog.component';

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
    MatDialogModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  private dialog = inject(MatDialog);

  currentWeekStart: Date;
  days: Date[] = [];
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  events: CalendarEvent[] = [];

  constructor() {
    this.currentWeekStart = this.getStartOfWeek(new Date());
    this.updateDays();
  }

  ngOnInit() {
    // Add some sample events
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

  get currentWeekEnd(): Date {
    const end = new Date(this.currentWeekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }

  getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  }

  updateDays() {
    this.days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(this.currentWeekStart);
      day.setDate(day.getDate() + i);
      return day;
    });
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.updateDays();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.updateDays();
  }

  getEventTop(event: CalendarEvent): number {
    const hours = event.start.getHours();
    const minutes = event.start.getMinutes();
    return hours * 60 + minutes;
  }

  getEventLeft(event: CalendarEvent): number {
    return event.start.getDay() * 14.285;
  }

  getEventHeight(event: CalendarEvent): number {
    const diff = event.end.getTime() - event.start.getTime();
    return Math.max(30, diff / (1000 * 60)); // Convert ms to minutes
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
