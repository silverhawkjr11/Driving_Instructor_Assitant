import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { importProvidersFrom } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from './environments/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
appConfig.providers = [...(appConfig.providers || []), MatNativeDateModule, MatMomentDateModule,
importProvidersFrom(

  AngularFireModule.initializeApp(environment.firebaseConfig),
  AngularFireAuthModule,
)
];

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => console.log('Application started'))
  // add the     AngularFireModule.initializeApp(environment.firebaseConfig) to the imports array

  .catch((err) => console.error(err));
