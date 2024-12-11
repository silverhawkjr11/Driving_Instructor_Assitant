// settings.component.ts
import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  template: `
    <div class="settings-container">

      <mat-form-field appearance="fill">

        <mat-select
          [value]="currentTheme"
          (selectionChange)="onThemeChange($event.value)">
          <mat-option
            *ngFor="let theme of themeService.themes"
            [value]="theme.value">
            {{ theme.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 20px;
    }
    mat-form-field {
      width: 100%;
      max-width: 400px;
    }
  `],
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    CommonModule
  ]
})
export class SettingsComponent implements OnInit {
  currentTheme: string | undefined;

  constructor(public themeService: ThemeService) { }

  ngOnInit() {
    this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  onThemeChange(themeUrl: string) {
    this.themeService.setTheme(themeUrl);
  }
}
