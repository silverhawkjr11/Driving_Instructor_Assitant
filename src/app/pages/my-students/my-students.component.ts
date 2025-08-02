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
  OnDestroy,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Fuse from 'fuse.js';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, first, map, of, Subject, Subscription, take, takeUntil, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
import { PaymentStatus, Student } from '../../../models/student.model';
import { Lesson } from '../../../models/lesson.model';
import { Auth } from '@angular/fire/auth';
import { TranslatePipe } from "../../pipes/translate.pipe";

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
    MatTimepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSortModule,
    MatExpansionModule,
    MatIcon,
    HammerModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    TranslatePipe
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
export class MyStudentsComponent implements OnDestroy {
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
  private studentsSubscription?: Subscription;
  private isInitialized = false; // Add flag to prevent re-initialization

  isLoading = signal(true);
  searchControl = new FormControl('');
  private fuse: Fuse<Student> | null = null;
  filteredStudents = signal<Student[]>([]);
  students = signal<Student[]>([]);
  currentStudentIndex = signal(0);
  showForm = signal(false);
  displayedColumns = ['date', 'duration', 'notes'];

  // Form definitions
  studentForm = new FormGroup({
    name: new FormControl('', Validators.required),
    phone: new FormControl('', [Validators.required, MyStudentsComponent.phoneValidator])
  });

  // Updated lesson form in my-students.component.ts
  lessonForm = new FormGroup({
    date: new FormControl(null, Validators.required),
    startTime: new FormControl('', Validators.required),
    duration: new FormControl(null, [Validators.required, Validators.min(1)]),
    cost: new FormControl(null, [Validators.required, Validators.min(0)]),
    notes: new FormControl(''),
    isPaid: new FormControl(false)
  });

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Only initialize once
    if (!this.isInitialized) {
      this.isInitialized = true;
      console.log('MyStudentsComponent: Initializing...'); // Debug log
      this.initializeStudents();
      this.initializeSearch();
    }
  }

  private initializeStudents() {
    // Cleanup any existing subscription
    if (this.studentsSubscription) {
      this.studentsSubscription.unsubscribe();
    }

    // Start with loading state
    this.isLoading.set(true);

    this.studentsSubscription = this.studentService.getStudents().pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((prev, curr) => {
        // Compare arrays to prevent unnecessary updates
        return JSON.stringify(prev) === JSON.stringify(curr);
      }),
      catchError(error => {
        console.error('Error loading students:', error);
        this.isLoading.set(false);
        return of([]);
      }),
      finalize(() => {
        // Always set loading to false when stream completes or errors
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (students) => {
        console.log('Students received:', students); // Debug log
        try {
          // Always process the data, even if it's an empty array
          const studentsArray = Array.isArray(students) ? students : [];
          const studentsWithLessons = studentsArray.map((student) => ({ 
            ...student, 
            lessons: student.lessons || [] // Use existing lessons if available
          }));
          
          console.log('Processed students:', studentsWithLessons); // Debug log
          
          // Always update the students, even if empty
          this.students.set(studentsWithLessons);
          this.filteredStudents.set(studentsWithLessons);

          // Initialize Fuse.js
          this.fuse = new Fuse(studentsWithLessons, {
            keys: ['name'],
            threshold: 0.3,
            location: 0,
            distance: 100,
          });

          // Load lessons for current student only if we have students
          if (studentsWithLessons.length > 0) {
            const currentIndex = this.currentStudentIndex();
            const validIndex = Math.min(currentIndex, studentsWithLessons.length - 1);
            
            if (currentIndex !== validIndex) {
              this.currentStudentIndex.set(validIndex);
            }
            
            const currentStudent = studentsWithLessons[validIndex];
            if (currentStudent?.id && !currentStudent.lessons?.length) {
              this.loadStudentLessons(currentStudent.id);
            }
          } else {
            // Reset current student index if no students
            this.currentStudentIndex.set(0);
          }
        } catch (error) {
          console.error('Error processing students data:', error);
        }
      },
      error: (error) => {
        console.error('Students subscription error:', error);
        this.isLoading.set(false);
      }
    });
  }

  private initializeSearch() {
    // Add debounce and distinctUntilChanged to prevent excessive filtering
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterStudents(searchTerm || '');
    });
  }

  // Computed properties
  currentStudent = computed(() => {
    const studentsList = this.students();
    if (!studentsList?.length) return null;
    const index = this.currentStudentIndex();
    return studentsList[index] || null;
  });

  // Phone validator - make it static to prevent recreating on each call
  static phoneValidator(control: any) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    if (control.value && !phoneRegex.test(control.value)) {
      return { invalidPhone: true };
    }
    return null;
  }

  // Navigation methods
  switchToFirstFilteredStudent() {
    const filteredStudents = this.filteredStudents();
    if (filteredStudents && filteredStudents.length > 0) {
      this.setCurrentStudent(filteredStudents[0]);
    }
  }

  setCurrentStudent(student: Student) {
    const mainIndex = this.students().findIndex(s => s.id === student.id);
    if (mainIndex !== -1 && mainIndex !== this.currentStudentIndex()) {
      this.currentStudentIndex.set(mainIndex);
      if (student.id && (!student.lessons || student.lessons.length === 0)) {
        this.loadStudentLessons(student.id);
      }
    }
  }

  nextStudent() {
    const students = this.students();
    if (students && this.currentStudentIndex() < students.length - 1) {
      const nextIndex = this.currentStudentIndex() + 1;
      this.currentStudentIndex.set(nextIndex);
      const nextStudent = students[nextIndex];
      if (nextStudent.id && (!nextStudent.lessons || nextStudent.lessons.length === 0)) {
        this.loadStudentLessons(nextStudent.id);
      }
    }
  }

  previousStudent() {
    if (this.currentStudentIndex() > 0) {
      const prevIndex = this.currentStudentIndex() - 1;
      this.currentStudentIndex.set(prevIndex);
      const prevStudent = this.students()[prevIndex];
      if (prevStudent.id && (!prevStudent.lessons || prevStudent.lessons.length === 0)) {
        this.loadStudentLessons(prevStudent.id);
      }
    }
  }

  // Touch event handlers
  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.isDragging = true;

    if (this.cardContainer?.nativeElement) {
      const card = this.cardContainer.nativeElement;
      card.style.transition = 'none';
    }
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || !this.cardContainer?.nativeElement) return;

    const currentX = event.touches[0].clientX;
    const diffX = currentX - this.startX;

    const card = this.cardContainer.nativeElement;
    card.style.transform = `translateX(${diffX}px)`;
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging || !this.cardContainer?.nativeElement) return;

    this.isDragging = false;
    const card = this.cardContainer.nativeElement;
    card.style.transition = 'transform 0.3s ease-out';

    const endX = event.changedTouches[0].clientX;
    const diffX = endX - this.startX;

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

  // Form methods
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
          phone: formValue.phone!,
          instructorId: this.auth.currentUser?.uid,
          startDate: new Date(),
          status: 'active',
          lessonsCompleted: 0,
          lastLesson: null,
          lessons: [],
          balance: 0,
          paymentStatus: PaymentStatus.PAID_UP,
          lastPaymentDate: null,
          progressNotes: '',
          isReadyForTest: false,
          createdAt: new Date()
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

  // Updated addLesson method
  async addLesson(studentId: string) {
    if (this.lessonForm.valid && this.currentStudent()) {
      this.isLoading.set(true);
      try {
        const formValue = this.lessonForm.value;
        const newLesson: Lesson = {
          date: formValue.date!,
          startTime: formValue.startTime!,
          duration: formValue.duration!,
          cost: formValue.cost!,
          notes: formValue.notes || '',
          isPaid: formValue.isPaid || false,
          status: 'completed',
          createdAt: new Date()
        };

        await this.studentService.addLesson(studentId, newLesson);

        // Update student stats
        const student = this.currentStudent()!;
        const updatedStudent: Partial<Student> = {
          lessonsCompleted: student.lessonsCompleted + 1,
          lastLesson: new Date(),
          isReadyForTest: (student.lessonsCompleted + 1) >= 30
        };

        // Update balance if lesson is not paid
        if (!newLesson.isPaid) {
          updatedStudent.balance = (student.balance || 0) + newLesson.cost;
          updatedStudent.paymentStatus = this.calculatePaymentStatus(
            updatedStudent.balance,
            student.lastPaymentDate
          );
        }

        await this.studentService.updateStudent(studentId, updatedStudent);

        // Refresh lessons for current student
        this.loadStudentLessons(studentId);
        this.lessonForm.reset();
      } catch (error) {
        console.error('Error adding lesson:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  // Dialog methods
  openPaymentDialog(student: any) {
    const amount = prompt(`Record payment for ${student.name}:`);
    if (amount && !isNaN(Number(amount))) {
      this.recordPayment(student.id, Number(amount));
    }
  }

  openProgressDialog(student: any) {
    const notes = prompt(`Update progress notes for ${student.name}:`, student.progressNotes || '');
    if (notes !== null) {
      this.updateProgressNotes(student.id, notes);
    }
  }

  showAllLessons(student: any) {
    alert(`${student.name} has ${student.lessons?.length || 0} total lessons`);
  }

  // Payment and progress methods
  async recordPayment(studentId: string, amount: number) {
    try {
      this.isLoading.set(true);
      await this.studentService.recordPayment(studentId, amount);
      // No need to reload all students, just refresh the specific student's lessons
      this.loadStudentLessons(studentId);
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateProgressNotes(studentId: string, notes: string) {
    try {
      // Don't set loading for this quick operation
      await this.studentService.updateProgressNotes(studentId, notes);

      // Update local student data without triggering refresh
      this.students.update(currentStudents => {
        const index = currentStudents.findIndex(s => s.id === studentId);
        if (index !== -1) {
          const updated = [...currentStudents];
          updated[index] = { ...updated[index], progressNotes: notes };
          return updated;
        }
        return currentStudents;
      });

    } catch (error) {
      console.error('Error updating progress notes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Helper methods
  getPaymentStatusClass(status: any): string {
    switch (status) {
      case PaymentStatus.PAID_UP:
      case 'PAID_UP':
        return 'status-paid';
      case PaymentStatus.OWES_MONEY:
      case 'OWES_MONEY':
        return 'status-owes';
      case PaymentStatus.OVERDUE:
      case 'OVERDUE':
        return 'status-overdue';
      default:
        return '';
    }
  }

  getPaymentStatusIcon(status: any): string {
    switch (status) {
      case PaymentStatus.PAID_UP:
      case 'PAID_UP':
        return 'check_circle';
      case PaymentStatus.OWES_MONEY:
      case 'OWES_MONEY':
        return 'schedule';
      case PaymentStatus.OVERDUE:
      case 'OVERDUE':
        return 'warning';
      default:
        return 'help';
    }
  }

  getPaymentStatusText(status: any): string {
    switch (status) {
      case PaymentStatus.PAID_UP:
      case 'PAID_UP':
        return 'Paid Up';
      case PaymentStatus.OWES_MONEY:
      case 'OWES_MONEY':
        return 'Owes Money';
      case PaymentStatus.OVERDUE:
      case 'OVERDUE':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  }

  getTestProgressPercentage(lessonsCompleted: number): number {
    return Math.min((lessonsCompleted / 30) * 100, 100);
  }

  private calculatePaymentStatus(balance: number, lastPaymentDate: Date | null): PaymentStatus {
    if (balance <= 0) return PaymentStatus.PAID_UP;

    if (!lastPaymentDate) return PaymentStatus.OWES_MONEY;

    const daysSincePayment = Math.floor((Date.now() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysSincePayment > 30 ? PaymentStatus.OVERDUE : PaymentStatus.OWES_MONEY;
  }

  private loadStudentLessons(studentId: string) {
    // Cleanup any existing subscription first
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = undefined;
    }

    // Check if lessons are already loaded for this student
    const student = this.students().find(s => s.id === studentId);
    if (student?.lessons && student.lessons.length > 0) {
      return; // Lessons already loaded
    }

    this.currentSubscription = this.studentService.getStudentLessons(studentId).pipe(
      take(1), // Only take one emission to prevent infinite loops
      tap(lessons => {
        // Only update the specific student's lessons
        this.students.update(currentStudents => {
          const index = currentStudents.findIndex(s => s.id === studentId);
          if (index === -1) return currentStudents;

          const currentLessons = currentStudents[index].lessons || [];
          
          // Only update if lessons have actually changed
          if (JSON.stringify(currentLessons) !== JSON.stringify(lessons)) {
            const updated = [...currentStudents];
            updated[index] = { ...updated[index], lessons };
            return updated;
          }
          return currentStudents;
        });
      }),
      catchError(error => {
        console.error('Error loading lessons:', error);
        return of([]);
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe();
  }

  refreshLessons() {
    const currentStudent = this.currentStudent();
    if (currentStudent?.id) {
      // Clear existing lessons first to force reload
      this.students.update(currentStudents => {
        const index = currentStudents.findIndex(s => s.id === currentStudent.id);
        if (index !== -1) {
          const updated = [...currentStudents];
          updated[index] = { ...updated[index], lessons: [] };
          return updated;
        }
        return currentStudents;
      });
      
      this.loadStudentLessons(currentStudent.id);
    }
  }

  private filterStudents(searchTerm: string) {
    const trimmedTerm = searchTerm.trim().toLowerCase();
    const currentFiltered = this.filteredStudents();
    
    if (!trimmedTerm) {
      const allStudents = this.students();
      // Only update if different
      if (allStudents.length !== currentFiltered.length ||
          allStudents.some((student, index) => student.id !== currentFiltered[index]?.id)) {
        this.filteredStudents.set(allStudents);
      }
      return;
    }

    if (this.fuse) {
      const results = this.fuse.search(trimmedTerm);
      const newFiltered = results.map(result => result.item);
      
      // Only update if different
      if (newFiltered.length !== currentFiltered.length ||
          newFiltered.some((student, index) => student.id !== currentFiltered[index]?.id)) {
        this.filteredStudents.set(newFiltered);
      }
    }
  }

  ngOnDestroy() {
    // Cleanup all subscriptions
    this.currentSubscription?.unsubscribe();
    this.studentsSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}