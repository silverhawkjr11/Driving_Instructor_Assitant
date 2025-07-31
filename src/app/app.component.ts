// src/app/app.component.ts
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './core/auth.service';
import { CommonModule } from '@angular/common';
import { LanguageSelectorComponent } from "./language-selector/language-selector.component";
import { TranslatePipe } from './pipes/translate.pipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    HeaderComponent,
    ReactiveFormsModule,
    CommonModule,
    LanguageSelectorComponent,
    TranslatePipe
  ]
})
export class AppComponent {
  title = 'frontend';
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  logout() {
    this.authService.doLogout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Error during logout:', error);
      // Even if there's an error, still redirect to login
      this.router.navigate(['/login']);
    });
  }
}