import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseUserModel } from '../core/user.model';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'page-user',
  templateUrl: 'user.component.html',
  styleUrl: 'user.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class UserComponent implements OnInit {

  user: FirebaseUserModel = new FirebaseUserModel();
  profileForm!: FormGroup;

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    this.route.data.subscribe(routeData => {
      let data = routeData['data'];
      if (data) {
        this.user = data;
        this.createForm(this.user.name);
      }
    })
  }

  createForm(name: string) {
    this.profileForm = this.fb.group({
      name: [name, Validators.required]
    });
  }

  save(value: any) {
    // TODO: implemet later
  }

  logout() {
    this.authService.doLogout()
      .then((res) => {
        this.location.back();
      }, (error) => {
        console.log("Logout error", error);
      });
  }
}
