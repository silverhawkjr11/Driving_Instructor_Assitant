import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatLabel } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    CommonModule
  ],
})
export class SettingsComponent {
  themes = [
    { name: 'Indigo & Pink', value: 'node_modules/@angular/material/prebuilt-themes/indigo-pink.css' },
    { name: 'Pink & Blue Grey', value: 'node_modules/@angular/material/prebuilt-themes/pink-bluegrey.css' },
    { name: 'Purple & Green', value: 'node_modules/@angular/material/prebuilt-themes/purple-green.css' },
  ];

  setTheme(theme: string) {
    const link = document.getElementById('app-theme') as HTMLLinkElement;
    link.href = theme;
  }
}
