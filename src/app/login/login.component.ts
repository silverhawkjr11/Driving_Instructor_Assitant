import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service'
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'page-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ]
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.createForm();
  }

  ngOnInit(): void {
    // Form is already created in constructor
    // Clear any previous error messages
    this.errorMessage = '';
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  tryGoogleLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.doGoogleLogin()
      .then(res => {
        this.router.navigate(['/my-students']);
      })
      .catch(err => {
        console.error('Google login error:', err);
        this.errorMessage = 'Google login failed. Please try again.';
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  tryLogin(value: { email: string; password: string }) {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.doLogin(value)
        .then(res => {
          this.router.navigate(['/my-students']);
        })
        .catch(err => {
          console.error('Login error:', err);
          this.errorMessage = this.getErrorMessage(err);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'Login failed. Please check your credentials and try again.';
    }
  }
}