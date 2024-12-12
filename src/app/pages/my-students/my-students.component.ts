import { AfterViewInit, Component, computed, ElementRef, Inject, inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';

import Hammer from 'hammerjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
@Component({
  standalone: true,
  selector: 'app-my-students',
  templateUrl: './my-students.component.html',
  styleUrls: ['./my-students.component.scss'],
  imports: [
    MatTableModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSortModule,
    MatExpansionModule,
    MatIcon,
    HammerModule
  ],
  animations: [
    trigger('cardAnimation', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: class extends HammerGestureConfig {
        override overrides = {
          swipe: { direction: 6 }  // Hammer.DIRECTION_HORIZONTAL
        }
      }
    }
  ]
})
// TODO: remove unused vars
export class MyStudentsComponent {
  @ViewChild('cardContainer') cardContainer!: ElementRef;
  private studentService = inject(StudentService);
  private isBrowser: boolean;
  private panStartX = 0;
  private startX = 0;
  private isDragging = false;
  private touchStartX = 0;
  private readonly SWIPE_THRESHOLD = 50; // minimum distance for swipe
  students = this.studentService.getStudents();
  currentStudentIndex = signal(0);
  showForm = signal(false);
  displayedColumns = ['date', 'duration', 'notes'];
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.isDragging = true;

    // Get the card element
    const card = this.cardContainer.nativeElement;
    // Remove transition while dragging
    card.style.transition = 'none';
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;

    const currentX = event.touches[0].clientX;
    const diffX = currentX - this.startX;

    // Get the card element
    const card = this.cardContainer.nativeElement;
    card.style.transform = `translateX(${diffX}px)`;
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;

    this.isDragging = false;
    const card = this.cardContainer.nativeElement;

    // Restore the transition
    card.style.transition = 'transform 0.3s ease-out';

    const endX = event.changedTouches[0].clientX;
    const diffX = endX - this.startX;

    // If swipe distance is greater than 100px, navigate
    if (Math.abs(diffX) > 100) {
      if (diffX > 0 && this.currentStudentIndex() > 0) {
        this.previousStudent();
      } else if (diffX < 0 && this.currentStudentIndex() < this.students().length - 1) {
        this.nextStudent();
      }
    }
    card.style.transform = 'translateX(0)';
  }
  // ngAfterViewInit(): void {
  //   if (this.isBrowser && this.cardContainer) {
  //     const hammer = new Hammer(this.cardContainer.nativeElement);
  //
  //     hammer.on('swipeleft', () => {
  //       this.nextStudent();
  //     });
  //
  //     hammer.on('swiperight', () => {
  //       this.previousStudent();
  //     });
  //   }
  // }
  // ngOnInit(): void {
  //   if (this.isBrowser) {
  //     import('hammerjs').then(() => {
  //       // HammerJS is now loaded
  //       console.log('HammerJS loaded');
  //     });
  //   }
  // }
  currentStudent = computed(() => {
    const students = this.students();
    return students[this.currentStudentIndex()];
  });

  studentForm = new FormGroup({
    name: new FormControl('', Validators.required),
    lastLesson: new FormControl(null, Validators.required),
  });

  lessonForm = new FormGroup({
    date: new FormControl(null, Validators.required),
    duration: new FormControl(null, [Validators.required, Validators.min(1)]),
    notes: new FormControl(''),
  });

  setCurrentStudent(index: number) {
    this.currentStudentIndex.set(index);
  }

  nextStudent() {
    if (this.currentStudentIndex() < this.students().length - 1) {
      this.currentStudentIndex.update(i => i + 1);
    }
  }

  previousStudent() {
    if (this.currentStudentIndex() > 0) {
      this.currentStudentIndex.update(i => i - 1);
    }
  }

  showAddStudentForm() {
    this.showForm.set(true);
  }

  hideAddStudentForm() {
    this.showForm.set(false);
    this.studentForm.reset();
  }

  addStudent() {
    if (this.studentForm.valid) {
      const formValue = this.studentForm.value;
      const newStudent = {
        id: Date.now(),
        name: formValue.name!,
        lastLesson: formValue.lastLesson!,
      };

      this.studentService.addStudent(newStudent);
      this.hideAddStudentForm();
    }
  }

  addLesson(studentId: number) {
    if (this.lessonForm.valid) {
      const formValue = this.lessonForm.value;
      const newLesson = {
        date: formValue.date!,
        duration: formValue.duration!,
        notes: formValue.notes || '',
      };

      this.studentService.addLesson(studentId, newLesson);
      this.lessonForm.reset();
    }
  }
  // onPanStart(event: any) {
  //   this.panStartX = event.center.x;
  // }
  //
  // onPanMove(event: any) {
  //   // Optional: Add visual feedback during pan
  //   if (this.cardContainer) {
  //     const element = this.cardContainer.nativeElement;
  //     const deltaX = event.center.x - this.panStartX;
  //     element.style.transform = `translateX(${deltaX}px)`;
  //   }
  // }
  //
  // onPanEnd(event: any) {
  //   if (this.cardContainer) {
  //     const element = this.cardContainer.nativeElement;
  //     const deltaX = event.center.x - this.panStartX;
  //
  //     // Reset transform
  //     element.style.transform = '';
  //
  //     // Determine if swipe was significant enough
  //     if (Math.abs(deltaX) > this.SWIPE_THRESHOLD) {
  //       if (deltaX > 0) {
  //         this.previousStudent();
  //       } else {
  //         this.nextStudent();
  //       }
  //     }
  //   }
  // }
}
