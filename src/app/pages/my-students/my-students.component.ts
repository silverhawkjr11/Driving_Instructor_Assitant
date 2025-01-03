import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, first, map, of, Subject, Subscription, take, takeUntil, tap } from 'rxjs';

import Hammer from 'hammerjs';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
  HammerModule,
} from '@angular/platform-browser';
import { Student } from '../../../models/student.model';
import { Lesson } from '../../../models/lesson.model';
import { Auth } from '@angular/fire/auth';
import { TimestampToDatePipe } from '../../pipes/timestamp-to-date.pipe';
import { FirestoreTimestampPipe } from '../../pipes/firestore-timestamp.pipe';

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
    HammerModule,
    MatProgressSpinnerModule,
    TimestampToDatePipe,
    FirestoreTimestampPipe,
  ],
  animations: [
    trigger('cardAnimation', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '200ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '200ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: class extends HammerGestureConfig {
        override overrides = {
          swipe: { direction: 6 }, // Hammer.DIRECTION_HORIZONTAL
        };
      },
    },
  ],
})
export class MyStudentsComponent {
  @ViewChild('cardContainer') cardContainer!: ElementRef;
  private studentService = inject(StudentService);
  private isBrowser: boolean;
  private panStartX = 0;
  private startX = 0;
  private isDragging = false;
  private touchStartX = 0;
  private auth = inject(Auth);
  private readonly SWIPE_THRESHOLD = 50; // minimum distance for swipe
  private destroy$ = new Subject<void>();
  private currentSubscription?: Subscription;

  isLoading = signal(true);
  private studentsObservable$ = this.studentService.getStudents().pipe(
    map((students) => {
      this.isLoading.set(false);
      if (students) {
        this.students.set(
          students.map((student) => ({ ...student, lessons: [] }))
        );
      }
      return students || [];
    })
  );

  students = signal<Student[]>([]); // Initialize as WritableSignal

  currentStudentIndex = signal(0);
  showForm = signal(false);
  displayedColumns = ['date', 'duration', 'notes'];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Subscribe to get initial students
    this.studentsObservable$.subscribe();

    // Load current student's lessons when index changes
    effect(() => {
      const index = this.currentStudentIndex();
      const student = this.students()[index];
      if (student?.id) {
        this.loadStudentLessons(student.id);
      }
    });
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
      } else if (
        diffX < 0 &&
        this.students() &&
        this.currentStudentIndex() < this.students()!.length - 1
      ) {
        this.nextStudent();
      }
    }
    card.style.transform = 'translateX(0)';
  }

  currentStudent = computed(() => {
    const studentsList = this.students();
    if (!studentsList?.length) return null;
    return studentsList[this.currentStudentIndex()];
  });

  studentForm = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  lessonForm = new FormGroup({
    date: new FormControl(null, Validators.required),
    duration: new FormControl(null, [Validators.required, Validators.min(1)]),
    notes: new FormControl(''),
  });

  setCurrentStudent(index: number) {
    this.currentStudentIndex.set(index);
    const student = this.students()[index];
    if (student?.id) {
      this.loadStudentLessons(student.id);
    }
  }

  nextStudent() {
    if (
      this.students() &&
      this.currentStudentIndex() < this.students()!.length - 1
    ) {
      this.currentStudentIndex.update((i) => i + 1);
    }
  }

  previousStudent() {
    if (this.currentStudentIndex() > 0) {
      this.currentStudentIndex.update((i) => i - 1);
    }
  }

  showAddStudentForm() {
    this.showForm.set(true);
  }

  hideAddStudentForm() {
    this.showForm.set(false);
    this.studentForm.reset();
  }

  async addStudent() {
    if (this.studentForm.valid) {
      this.isLoading.set(true);
      try {
        const formValue = this.studentForm.value;
        const newStudent: Partial<Student> = {
          name: formValue.name!,
          instructorId: this.auth.currentUser?.uid, // Add this line
          phone: '',
          startDate: new Date(),
          status: 'active',
          lessonsCompleted: 0,
          lastLesson: null,
          lessons: [],
        };
        await this.studentService.addStudent(newStudent);
        this.hideAddStudentForm();
      } catch (error) {
        console.error('Error adding student:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async addLesson(studentId: string) {
    if (this.lessonForm.valid) {
      this.isLoading.set(true);
      try {
        const formValue = this.lessonForm.value;
        const newLesson: Lesson = {
          date: formValue.date!,
          duration: formValue.duration!,
          notes: formValue.notes || '',
          payment: 0,
          status: 'scheduled',
        };
        await this.studentService.addLesson(studentId, newLesson);
        this.loadStudentLessons(studentId); // Reload lessons after adding
        this.lessonForm.reset();
      } catch (error) {
        console.error('Error adding lesson:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }
  private loadStudentLessons(studentId: string) {
    // Cleanup any existing subscription
    this.currentSubscription?.unsubscribe();
    
    console.log('Loading started');
    this.isLoading.set(true);
    
    this.currentSubscription = this.studentService.getStudentLessons(studentId).pipe(
      first(), // Take first value and complete
      tap(lessons => {
        console.log('Processing lessons:', lessons);
        this.students.update(currentStudents => {
          const index = currentStudents.findIndex(s => s.id === studentId);
          if (index === -1) return currentStudents;
          
          const updated = [...currentStudents];
          updated[index] = { ...updated[index], lessons };
          return updated;
        });
      }),
      catchError(error => {
        console.error('Error loading lessons:', error);
        return of([]);
      }),
      finalize(() => {
        console.log('Loading finished');
        this.isLoading.set(false);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.currentSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
