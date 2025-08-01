// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
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
import { ThemeService } from './services/theme.service';

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
export class AppComponent implements OnInit {
  title = 'frontend';
  
  constructor(
    public authService: AuthService,
    private router: Router,
    private themeService: ThemeService // Initialize theme service
  ) { }

  ngOnInit(): void {
    // Theme service will automatically handle theme application based on routes
    // Force apply theme if we're not on login page
    this.themeService.forceApplyCurrentTheme();
  }

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