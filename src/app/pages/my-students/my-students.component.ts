import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-my-students',
  templateUrl: './my-students.component.html',
  imports: [MatTableModule, CommonModule], // Import MatTableModule and CommonModule
})
export class MyStudentsComponent {
  ngOnInit() {
    console.log('MyStudentsComponent initialized');
    console.log('Students:', this.students);
  }
  displayedColumns: string[] = ['id', 'name', 'lastLesson'];
  students = [
    { id: 1, name: 'Alice', lastLesson: '2024-11-01' },
    { id: 2, name: 'Bob', lastLesson: '2024-11-15' },
    { id: 3, name: 'Charlie', lastLesson: '2024-11-20' },
  ];
}
