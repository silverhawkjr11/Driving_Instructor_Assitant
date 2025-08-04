import { RouterModule, Routes } from '@angular/router';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { MyStudentsComponent } from './pages/my-students/my-students.component';
import { NgModule } from '@angular/core';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { authGuard } from './core/auth.guard'; // Updated import
import { UserResolver } from './user/user.resolver';
import { authRedirectGuard } from './core/auth-redirect.guard';

export const routes: Routes = [
  { 
    path: 'my-students', 
    component: MyStudentsComponent, 
    canActivate: [authGuard] // Using functional guard
  },
  { 
    path: 'schedule', 
    component: ScheduleComponent, 
    canActivate: [authGuard] // Using functional guard
  },
  { 
    path: 'settings', 
    component: SettingsComponent, 
    canActivate: [authGuard] // Using functional guard
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [authRedirectGuard]
  },
  { 
    path: '', 
    redirectTo: '/my-students', // Simple redirect instead of guard
    pathMatch: 'full'
  },
  // Catch-all route (optional)
  { 
    path: '**', 
    redirectTo: '/my-students' 
  }
  // { path: 'register', component: RegisterComponent, canActivate: [authGuard] },
  // { path: 'user', component: UserComponent, resolve: { data: UserResolver } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }