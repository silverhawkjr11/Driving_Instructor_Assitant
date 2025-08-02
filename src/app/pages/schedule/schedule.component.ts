// schedule.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CalendarComponent } from '../../calendar/calendar.component';
import { ThemeService } from '../../services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    CalendarComponent,
    TranslatePipe
  ]
})
export class ScheduleComponent implements OnInit {
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Ensure theme is applied when schedule loads
    this.themeService.forceApplyCurrentTheme();
  }
}