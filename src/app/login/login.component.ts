import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service'
import { Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'page-login',
  templateUrl: 'login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
  }
  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }



  tryGoogleLogin() {
    this.authService.doGoogleLogin()
      .then(res => {
        this.router.navigate(['/user']);
      })
  }

  tryLogin(value: { email: any; password: any; }) {
    this.authService.doLogin(value)
      .then(res => {
        this.router.navigate(['/user']);
      }, err => {
        console.log(err);
        this.errorMessage = err.message;
      })
  }
}
