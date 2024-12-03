import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';

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
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    MatInput
  ]
})
export class AppComponent {
  title = 'frontend';
  themes = [
    { name: 'Indigo & Pink', value: 'indigo-pink.css' },
    { name: 'Pink & Blue Grey', value: 'pink-bluegrey.css' },
    { name: 'Purple & Green', value: 'purple-green.css' }
  ];

  setTheme(theme: string) {
    const link = document.getElementById('app-theme') as HTMLLinkElement;
    link.href = theme;
  }

}
