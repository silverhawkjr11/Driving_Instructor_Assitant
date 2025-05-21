// theme.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'selected-theme';

  themes = [
    { name: 'Catppuccin Mocha', value: 'assets/themes/catppuccin-mocha.css' },
    { name: 'Indigo & Pink', value: 'assets/themes/indigo-pink.css' },
    { name: 'Pink & Blue Grey', value: 'assets/themes/pink-bluegrey.css' },
    { name: 'Purple & Green', value: 'assets/themes/purple-green.css' },
    { name: 'Deep Purple & Amber', value: 'assets/themes/deeppurple-amber.css' },
    { name: 'rose red', value: 'assets/themes/rose-red.css' },
    { name: 'azure blue', value: 'assets/themes/azure-blue.css' },
    { name: 'cayan orange', value: 'assets/themes/cayan-orange.css' },
    { name: 'magenta violet', value: 'assets/themes/magenta-violet.css' },
  ];

  private currentTheme = new BehaviorSubject<string>(this.themes[0].value);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (savedTheme) {
        this.setTheme(savedTheme);
      }
    }
  }

  setTheme(themeUrl: string) {
    if (isPlatformBrowser(this.platformId)) {
      const head = document.getElementsByTagName('head')[0];
      let themeLink = document.getElementById('app-theme') as HTMLLinkElement;

      if (!themeLink) {
        themeLink = document.createElement('link');
        themeLink.id = 'app-theme';
        themeLink.rel = 'stylesheet';
        head.appendChild(themeLink);
      }

      themeLink.href = themeUrl;
      localStorage.setItem(this.THEME_KEY, themeUrl);
      this.currentTheme.next(themeUrl);
    }
  }

  getCurrentTheme() {
    return this.currentTheme.asObservable();
  }
}
