// src/app/services/language.service.ts
import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  public readonly supportedLanguages: Language[] = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      dir: 'ltr'
    },
    {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      flag: '🇸🇦',
      dir: 'rtl'
    },
    {
      code: 'he',
      name: 'Hebrew',
      nativeName: 'עברית',
      flag: '🇮🇱',
      dir: 'rtl'
    },
    {
      code: 'ru',
      name: 'Russian',
      nativeName: 'Русский',
      flag: '🇷🇺',
      dir: 'ltr'
    }
  ];

  constructor(@Inject(LOCALE_ID) private localeId: string) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const savedLang = localStorage.getItem('selectedLanguage');
    const browserLang = this.localeId.split('-')[0];
    
    let selectedLang: Language;
    
    if (savedLang) {
      selectedLang = this.supportedLanguages.find(lang => lang.code === savedLang) || this.getDefaultLanguage();
    } else {
      selectedLang = this.supportedLanguages.find(lang => lang.code === browserLang) || this.getDefaultLanguage();
    }
    
    this.setLanguage(selectedLang);
  }

  private getDefaultLanguage(): Language {
    return this.supportedLanguages[0]; // English
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('selectedLanguage', language.code);
    this.updateDocumentDirection(language.dir);
    this.updateHtmlLang(language.code);
  }

  private updateDocumentDirection(dir: 'ltr' | 'rtl'): void {
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
  }

  private updateHtmlLang(lang: string): void {
    document.documentElement.lang = lang;
  }

  isRTL(): boolean {
    return this.getCurrentLanguage().dir === 'rtl';
  }

  // For switching languages (will reload the page with new locale)
  switchLanguage(language: Language): void {
    if (language.code === this.getCurrentLanguage().code) {
      return;
    }

    this.setLanguage(language);
    
    // In a production app, you'd redirect to the localized version
    // For now, we'll reload the page
    const baseUrl = window.location.origin;
    const newUrl = language.code === 'en' ? baseUrl : `${baseUrl}/${language.code}`;
    
    // Store the current path to redirect after language change
    localStorage.setItem('redirectPath', window.location.pathname);
    
    window.location.href = newUrl;
  }
}