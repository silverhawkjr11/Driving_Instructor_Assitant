// theme.service.ts - Fixed version that properly applies themes on navigation
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'selected-theme';
  private readonly DEFAULT_THEME = 'assets/themes/indigo-pink.css';

  themes = [
    { name: 'Indigo & Pink', value: 'assets/themes/indigo-pink.css' },
    { name: 'Pink & Blue Grey', value: 'assets/themes/pink-bluegrey.css' },
    { name: 'Purple & Green', value: 'assets/themes/purple-green.css' },
    { name: 'Deep Purple & Amber', value: 'assets/themes/deeppurple-amber.css' },
    { name: 'Catppuccin Mocha', value: 'assets/themes/catppuccin-mocha.css' },
    { name: 'Rose Red', value: 'assets/themes/rose-red.css' },
    { name: 'Azure Blue', value: 'assets/themes/azure-blue.css' },
    { name: 'Cyan Orange', value: 'assets/themes/cyan-orange.css' },
    { name: 'Magenta Violet', value: 'assets/themes/magenta-violet.css' },
  ];

  private currentTheme = new BehaviorSubject<string>(this.DEFAULT_THEME);
  private isThemeApplied = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.setupRouterListener();
    }
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || this.DEFAULT_THEME;
    this.currentTheme.next(savedTheme);
    
    // Apply theme immediately, regardless of current route
    // We'll let the router listener handle login page logic
    this.applyTheme(savedTheme);
  }

  private setupRouterListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Small delay to ensure the route has fully loaded
      setTimeout(() => {
        if (this.isLoginPage(event.url)) {
          this.removeTheme();
        } else {
          const currentTheme = this.currentTheme.value;
          this.applyTheme(currentTheme);
        }
      }, 0);
    });
  }

  private isLoginPage(url?: string): boolean {
    const currentUrl = url || this.router.url;
    return currentUrl === '/login' || currentUrl.startsWith('/login');
  }

  setTheme(themeUrl: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, themeUrl);
      this.currentTheme.next(themeUrl);
      
      // Always apply the theme immediately when set
      if (!this.isLoginPage()) {
        this.applyTheme(themeUrl);
      }
    }
  }

  private applyTheme(themeUrl: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // ALWAYS remove the old theme link first
    this.removeAllThemeLinks();

    // Create a completely new theme link element
    const head = document.getElementsByTagName('head')[0];
    const themeLink = document.createElement('link');
    
    // Use a unique ID with timestamp to avoid any caching issues
    themeLink.id = `app-theme-${Date.now()}`;
    themeLink.rel = 'stylesheet';
    themeLink.type = 'text/css';
    
    // Add cache-busting parameter to force fresh load
    const cacheBuster = `?v=${Date.now()}`;
    themeLink.href = themeUrl + cacheBuster;
    
    // Add onload handler to track when theme is applied
    themeLink.onload = () => {
      this.isThemeApplied = true;
    };
    
    // Add the new theme link to head
    head.appendChild(themeLink);
  }

  private removeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.removeAllThemeLinks();
    this.isThemeApplied = false;
  }

  private removeAllThemeLinks(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove all theme links (in case there are multiple)
    const head = document.getElementsByTagName('head')[0];
    const themeLinks = head.querySelectorAll('link[id^="app-theme"]');
    
    themeLinks.forEach(link => {
      link.remove();
    });

    // Also remove any links with the old static ID
    const oldThemeLink = document.getElementById('app-theme');
    if (oldThemeLink) {
      oldThemeLink.remove();
    }
  }

  getCurrentTheme(): Observable<string> {
    return this.currentTheme.asObservable();
  }

  getCurrentThemeValue(): string {
    return this.currentTheme.value;
  }

  getThemeName(themeUrl: string): string {
    const theme = this.themes.find(t => t.value === themeUrl);
    return theme ? theme.name : 'Unknown Theme';
  }

  forceApplyCurrentTheme(): void {
    if (!this.isLoginPage()) {
      this.applyTheme(this.currentTheme.value);
    }
  }

  isThemeCurrentlyApplied(): boolean {
    return this.isThemeApplied;
  }
}