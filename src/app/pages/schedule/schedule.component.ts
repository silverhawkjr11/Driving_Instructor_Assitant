import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../../calendar/calendar.component';

@Component({
  standalone: true,
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  imports: [CommonModule,
    CalendarComponent
  ], // Import CommonModule for *ngFor
})
export class ScheduleComponent {
  schedule = [
    { date: '2024-12-01', studentName: 'Alice', time: '10:00 AM' },
    { date: '2024-12-01', studentName: 'Bob', time: '11:00 AM' },
    { date: '2024-12-01', studentName: 'Charlie', time: '01:00 PM' },
  ];
}
