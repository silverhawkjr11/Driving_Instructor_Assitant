import { RouterModule, Routes } from '@angular/router';
import { ScheduleComponent } from './pages/schedule/schedule.component';
import { MyStudentsComponent } from './pages/my-students/my-students.component';
import { NgModule } from '@angular/core';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [

  { path: 'my-students', component: MyStudentsComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '', redirectTo: '/my-students', pathMatch: 'full' }, // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
