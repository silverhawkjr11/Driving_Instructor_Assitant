// Replace src/app/services/translation.service.ts with this:

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  public readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' }
  ];

  private translations: { [langCode: string]: { [key: string]: string } } = {
    en: {
      'add.student': 'Add Student',
      'search.students.placeholder': 'Search students...',
      'loading.students': 'Loading students...',
      'no.matches.found': 'No matches found',
      'no.students.yet': 'No students yet',
      'click.add.student.start': 'Click "Add Student" to get started',
      'not.set': 'Not set',
      'started.label': 'Started:',
      'last.lesson.label': 'Last Lesson:',
      'ready.for.test': 'Ready for Test',
      'more.lessons.needed': '{{count}} more needed',
      'paid.up': 'Paid Up',
      'owes.money': 'Owes Money',
      'payment.overdue': 'Payment Overdue',
      'balance.label': 'Balance',
      'lessons.completed.label': 'Lessons Completed',
      'test.progress.label': 'Test Progress',
      'record.payment.button': 'Record Payment',
      'update.progress.button': 'Update Progress',
      'recent.lessons.title': 'Recent Lessons',
      'no.lessons.recorded': 'No lessons recorded yet',
      'add.new.lesson.title': 'Add New Lesson',
      'minutes.short': 'min',
      'date.label': 'Date',
      'duration.minutes.label': 'Duration (minutes)',
      'cost.label': 'Cost',
      'notes.label': 'Notes',
      'name.label': 'Name',
      'phone.number.label': 'Phone Number',
      'mark.as.paid.checkbox': 'Mark as Paid',
      'add.lesson.button': 'Add Lesson',
      'cancel.button': 'Cancel',
      'add.student.button': 'Add Student',
      'add.new.student.title': 'Add New Student',
      'enter.student.name': "Enter student's name",
      'enter.phone.number': 'Enter phone number',
      'name.required.error': 'Name is required',
      'phone.required.error': 'Phone number is required',
      'phone.invalid.error': 'Please enter a valid phone number'
    },
    ar: {
      'add.student': 'إضافة طالب',
      'search.students.placeholder': 'البحث عن الطلاب...',
      'loading.students': 'جاري تحميل الطلاب...',
      'no.matches.found': 'لا توجد نتائج',
      'no.students.yet': 'لا يوجد طلاب بعد',
      'click.add.student.start': 'انقر على "إضافة طالب" للبدء',
      'not.set': 'غير محدد',
      'started.label': 'البداية:',
      'last.lesson.label': 'آخر درس:',
      'ready.for.test': 'جاهز للاختبار',
      'more.lessons.needed': 'يحتاج {{count}} دروس أخرى',
      'paid.up': 'مسدد',
      'owes.money': 'عليه أموال',
      'payment.overdue': 'دفع متأخر',
      'balance.label': 'الرصيد',
      'lessons.completed.label': 'الدروس المكتملة',
      'test.progress.label': 'تقدم الاختبار',
      'record.payment.button': 'تسجيل دفعة',
      'update.progress.button': 'تحديث التقدم',
      'recent.lessons.title': 'الدروس الحديثة',
      'no.lessons.recorded': 'لم يتم تسجيل دروس بعد',
      'add.new.lesson.title': 'إضافة درس جديد',
      'minutes.short': 'د',
      'date.label': 'التاريخ',
      'duration.minutes.label': 'المدة (بالدقائق)',
      'cost.label': 'التكلفة',
      'notes.label': 'ملاحظات',
      'name.label': 'الاسم',
      'phone.number.label': 'رقم الهاتف',
      'mark.as.paid.checkbox': 'وضع علامة كمدفوع',
      'add.lesson.button': 'إضافة درس',
      'cancel.button': 'إلغاء',
      'add.student.button': 'إضافة طالب',
      'add.new.student.title': 'إضافة طالب جديد',
      'enter.student.name': 'أدخل اسم الطالب',
      'enter.phone.number': 'أدخل رقم الهاتف',
      'name.required.error': 'الاسم مطلوب',
      'phone.required.error': 'رقم الهاتف مطلوب',
      'phone.invalid.error': 'يرجى إدخال رقم هاتف صحيح'
    },
    he: {
      'add.student': 'הוסף תלמיד',
      'search.students.placeholder': 'חיפוש תלמידים...',
      'loading.students': 'טוען תלמידים...',
      'no.matches.found': 'לא נמצאו תוצאות',
      'no.students.yet': 'אין תלמידים עדיין',
      'click.add.student.start': 'לחץ על "הוסף תלמיד" כדי להתחיל',
      'not.set': 'לא הוגדר',
      'started.label': 'התחיל:',
      'last.lesson.label': 'שיעור אחרון:',
      'ready.for.test': 'מוכן למבחן',
      'more.lessons.needed': 'צריך עוד {{count}} שיעורים',
      'paid.up': 'שולם',
      'owes.money': 'חייב כסף',
      'payment.overdue': 'תשלום באיחור',
      'balance.label': 'יתרה',
      'lessons.completed.label': 'שיעורים שהושלמו',
      'test.progress.label': 'התקדמות מבחן',
      'record.payment.button': 'רשום תשלום',
      'update.progress.button': 'עדכן התקדמות',
      'recent.lessons.title': 'שיעורים אחרונים',
      'no.lessons.recorded': 'לא נרשמו שיעורים עדיין',
      'add.new.lesson.title': 'הוסף שיעור חדש',
      'minutes.short': 'דק',
      'date.label': 'תאריך',
      'duration.minutes.label': 'משך (בדקות)',
      'cost.label': 'עלות',
      'notes.label': 'הערות',
      'name.label': 'שם',
      'phone.number.label': 'מספר טלפון',
      'mark.as.paid.checkbox': 'סמן כשולם',
      'add.lesson.button': 'הוסף שיעור',
      'cancel.button': 'ביטול',
      'add.student.button': 'הוסף תלמיד',
      'add.new.student.title': 'הוסף תלמיד חדש',
      'enter.student.name': 'הכנס שם תלמיד',
      'enter.phone.number': 'הכנס מספר טלפון',
      'name.required.error': 'שם נדרש',
      'phone.required.error': 'מספר טלפון נדרש',
      'phone.invalid.error': 'אנא הכנס מספר טלפון תקין'
    },
    ru: {
      'add.student': 'Добавить ученика',
      'search.students.placeholder': 'Поиск учеников...',
      'loading.students': 'Загрузка учеников...',
      'no.matches.found': 'Совпадений не найдено',
      'no.students.yet': 'Учеников пока нет',
      'click.add.student.start': 'Нажмите "Добавить ученика", чтобы начать',
      'not.set': 'Не установлено',
      'started.label': 'Начал:',
      'last.lesson.label': 'Последний урок:',
      'ready.for.test': 'Готов к экзамену',
      'more.lessons.needed': 'Нужно еще {{count}} уроков',
      'paid.up': 'Оплачено',
      'owes.money': 'Должен деньги',
      'payment.overdue': 'Просрочка платежа',
      'balance.label': 'Баланс',
      'lessons.completed.label': 'Уроков завершено',
      'test.progress.label': 'Прогресс экзамена',
      'record.payment.button': 'Записать платеж',
      'update.progress.button': 'Обновить прогресс',
      'recent.lessons.title': 'Недавние уроки',
      'no.lessons.recorded': 'Уроки еще не записаны',
      'add.new.lesson.title': 'Добавить новый урок',
      'minutes.short': 'мин',
      'date.label': 'Дата',
      'duration.minutes.label': 'Продолжительность (минуты)',
      'cost.label': 'Стоимость',
      'notes.label': 'Заметки',
      'name.label': 'Имя',
      'phone.number.label': 'Номер телефона',
      'mark.as.paid.checkbox': 'Отметить как оплаченный',
      'add.lesson.button': 'Добавить урок',
      'cancel.button': 'Отмена',
      'add.student.button': 'Добавить ученика',
      'add.new.student.title': 'Добавить нового ученика',
      'enter.student.name': 'Введите имя ученика',
      'enter.phone.number': 'Введите номер телефона',
      'name.required.error': 'Имя обязательно',
      'phone.required.error': 'Номер телефона обязателен',
      'phone.invalid.error': 'Пожалуйста, введите действительный номер телефона'
    }
  };

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const savedLang = localStorage.getItem('selectedLanguage');
    const browserLang = navigator.language.split('-')[0];

    let selectedLang: Language;

    if (savedLang) {
      selectedLang = this.supportedLanguages.find(lang => lang.code === savedLang) || this.getDefaultLanguage();
    } else {
      selectedLang = this.supportedLanguages.find(lang => lang.code === browserLang) || this.getDefaultLanguage();
    }

    this.setLanguage(selectedLang);
  }

  private getDefaultLanguage(): Language {
    return this.supportedLanguages[0];
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    localStorage.setItem('selectedLanguage', language.code);
    this.updateDocumentDirection(language);
    document.documentElement.lang = language.code;
  }

  private updateDocumentDirection(language: Language): void {
    document.documentElement.dir = language.dir;
    document.documentElement.setAttribute('dir', language.dir);
  }

  translate(key: string, params?: { [key: string]: any }): string {
    const currentLang = this.getCurrentLanguage().code;
    const translations = this.translations[currentLang] || this.translations['en'];
    let translation = translations[key] || key;

    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param].toString());
      });
    }

    return translation;
  }

  isRTL(): boolean {
    return this.getCurrentLanguage().dir === 'rtl';
  }
}
