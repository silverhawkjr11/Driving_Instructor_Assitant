import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideNativeDateAdapter } from '@angular/material/core';
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay()), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync(),
  provideNativeDateAdapter(), // Add this line
  { provide: MAT_DATE_LOCALE, useValue: 'en-US' } // Optional: specify locale
  ]
};
