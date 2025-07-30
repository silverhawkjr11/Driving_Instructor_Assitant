import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service'
import { Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'page-login',
  templateUrl: 'login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule
  ]
})
export class LoginComponent {

  loginForm: FormGroup | undefined;
  errorMessage: string = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createForm();
  }
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    if (this.authService.isLoggedIn$)
    {
        this.router.navigate(['/my-students']);
    }
  }
  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }



  tryGoogleLogin() {
    console.log('try google login');
    this.authService.doGoogleLogin()
      .then(res => {
        this.router.navigate(['/my-students']);
      })
      .catch(err => console.log(err));
  }

  tryLogin(value: { email: any; password: any; }) {
    this.authService.doLogin(value)
      .then(res => {
        this.router.navigate(['/my-students']);
      }, err => {
        console.log(err);
        this.errorMessage = err.message;
      })
  }

  tryRegister(value: { email: any; password: any; }) {
    this.authService.doRegister(value)
      .then(res => {
        this.router.navigate(['/my-students']);
      }, err => {
        console.log(err);
        this.errorMessage = err.message;
      })
  }
}
