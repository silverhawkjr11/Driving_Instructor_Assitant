// src/app/language-selector/language-selector.component.ts
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Language, TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="languageMenu" class="language-btn">
      <span class="flag">{{ currentLanguage().flag }}</span>
    </button>

    <mat-menu #languageMenu="matMenu" class="language-menu">
      @for (language of supportedLanguages; track language.code) {
        <button
          mat-menu-item
          (click)="selectLanguage(language)"
          [class.active]="currentLanguage().code === language.code">
          <span class="flag">{{ language.flag }}</span>
          <span class="language-name">{{ language.nativeName }}</span>
          @if (currentLanguage().code === language.code) {
            <mat-icon class="check-icon">check</mat-icon>
          }
        </button>
      }
    </mat-menu>
  `,
  styles: [`
    .language-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .flag {
        font-size: 20px;
        line-height: 1;
      }
    }

    ::ng-deep .language-menu {
      .mat-mdc-menu-content {
        background: #2d2d2d;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        min-width: 180px;
      }

      .mat-mdc-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        border-radius: 8px;
        margin: 4px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        &.active {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
        }

        .flag {
          font-size: 18px;
          min-width: 24px;
        }

        .language-name {
          flex: 1;
          font-weight: 500;
        }

        .check-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #4caf50;
        }
      }
    }
  `]
})
export class LanguageSelectorComponent {
  private translationService = inject(TranslationService);
  private router = inject(Router);

  // Use computed instead of Observable
  currentLanguage = computed(() => this.translationService.currentLanguage$());
  supportedLanguages = this.translationService.supportedLanguages;

  selectLanguage(language: Language): void {
    // Only proceed if we're actually changing to a different language
    if (this.currentLanguage().code !== language.code) {
      this.translationService.setLanguage(language);
      
      // Use full page reload instead of router refresh to ensure proper CSS application
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }
}