import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
appConfig.providers = [...(appConfig.providers || []), MatNativeDateModule, MatMomentDateModule];

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
