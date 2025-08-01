// settings.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    CommonModule
  ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  currentTheme: string = '';
  private destroy$ = new Subject<void>();

  constructor(public themeService: ThemeService) { }

  ngOnInit(): void {
    // Subscribe to current theme changes
    this.themeService.getCurrentTheme().pipe(
      takeUntil(this.destroy$)
    ).subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onThemeChange(themeUrl: string): void {
    this.themeService.setTheme(themeUrl);
  }

  getCurrentThemeName(): string {
    return this.themeService.getThemeName(this.currentTheme);
  }
}