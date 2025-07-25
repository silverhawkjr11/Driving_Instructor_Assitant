// src/app/services/translation.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    dir: 'ltr' | 'rtl';
}

export interface Translations {
    [key: string]: string;
}

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
    public currentLanguage$ = this.currentLanguageSubject.asObservable();

    public readonly supportedLanguages: Language[] = [
        {
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇺🇸',
            dir: 'ltr'
        },
        {
            code: 'ar',
            name: 'Arabic',
            nativeName: 'العربية',
            flag: '🇸🇦',
            dir: 'rtl'
        },
        {
            code: 'he',
            name: 'Hebrew',
            nativeName: 'עברית',
            flag: '🇮🇱',
            dir: 'rtl'
        },
        {
            code: 'ru',
            name: 'Russian',
            nativeName: 'Русский',
            flag: '🇷🇺',
            dir: 'ltr'
        }
    ];

    private translations: { [langCode: string]: Translations } = {
        en: {
            // Navigation
            'search.students.placeholder': 'Search students...',
            'add.student': 'Add Student',
            'loading.students': 'Loading students...',
            'no.matches.found': 'No matches found',
            'try.different.search': 'Try a different search term',
            'no.students.yet': 'No students yet',
            'click.add.student.start': 'Click "Add Student" to get started',

            // Student Details
            'not.set': 'Not set',
            'started.label': 'Started:',
            'last.lesson.label': 'Last Lesson:',
            'ready.for.test': 'Ready for Test',
            'more.lessons.needed': '{{count}} more needed',

            // Payment Status
            'paid.up': 'Paid Up',
            'owes.money': 'Owes Money',
            'payment.overdue': 'Payment Overdue',

            // Stats
            'balance.label': 'Balance',
            'lessons.completed.label': 'Lessons Completed',
            'test.progress.label': 'Test Progress',

            // Actions
            'record.payment.button': 'Record Payment',
            'update.progress.button': 'Update Progress',

            // Lessons
            'recent.lessons.title': 'Recent Lessons',
            'no.lessons.recorded': 'No lessons recorded yet',
            'add.new.lesson.title': 'Add New Lesson',
            'view.all.lessons': 'View All {{count}} Lessons',
            'minutes.short': 'min',

            // Form Labels
            'date.label': 'Date',
            'duration.minutes.label': 'Duration (minutes)',
            'cost.label': 'Cost',
            'notes.label': 'Notes',
            'name.label': 'Name',
            'phone.number.label': 'Phone Number',
            'mark.as.paid.checkbox': 'Mark as Paid',

            // Buttons
            'add.lesson.button': 'Add Lesson',
            'cancel.button': 'Cancel',
            'add.student.button': 'Add Student',

            // Dialogs
            'add.new.student.title': 'Add New Student',
            'progress.notes.title': 'Progress Notes',

            // Placeholders
            'enter.student.name': "Enter student's name",
            'enter.phone.number': 'Enter phone number',

            // Errors
            'name.required.error': 'Name is required',
            'phone.required.error': 'Phone number is required',
            'phone.invalid.error': 'Please enter a valid phone number'
        },

        ar: {
            // Navigation
            'search.students.placeholder': 'البحث عن الطلاب...',
            'add.student': 'إضافة طالب',
            'loading.students': 'جاري تحميل الطلاب...',
            'no.matches.found': 'لا توجد نتائج',
            'try.different.search': 'جرب مصطلح بحث مختلف',
            'no.students.yet': 'لا يوجد طلاب بعد',
            'click.add.student.start': 'انقر على "إضافة طالب" للبدء',

            // Student Details
            'not.set': 'غير محدد',
            'started.label': 'البداية:',
            'last.lesson.label': 'آخر درس:',
            'ready.for.test': 'جاهز للاختبار',
            'more.lessons.needed': 'يحتاج {{count}} دروس أخرى',

            // Payment Status
            'paid.up': 'مسدد',
            'owes.money': 'عليه أموال',
            'payment.overdue': 'دفع متأخر',

            // Stats
            'balance.label': 'الرصيد',
            'lessons.completed.label': 'الدروس المكتملة',
            'test.progress.label': 'تقدم الاختبار',

            // Actions
            'record.payment.button': 'تسجيل دفعة',
            'update.progress.button': 'تحديث التقدم',

            // Lessons
            'recent.lessons.title': 'الدروس الحديثة',
            'no.lessons.recorded': 'لم يتم تسجيل دروس بعد',
            'add.new.lesson.title': 'إضافة درس جديد',
            'view.all.lessons': 'عرض جميع الدروس ({{count}})',
            'minutes.short': 'د',

            // Form Labels
            'date.label': 'التاريخ',
            'duration.minutes.label': 'المدة (بالدقائق)',
            'cost.label': 'التكلفة',
            'notes.label': 'ملاحظات',
            'name.label': 'الاسم',
            'phone.number.label': 'رقم الهاتف',
            'mark.as.paid.checkbox': 'وضع علامة كمدفوع',

            // Buttons
            'add.lesson.button': 'إضافة درس',
            'cancel.button': 'إلغاء',
            'add.student.button': 'إضافة طالب',

            // Dialogs
            'add.new.student.title': 'إضافة طالب جديد',
            'progress.notes.title': 'ملاحظات التقدم',

            // Placeholders
            'enter.student.name': 'أدخل اسم الطالب',
            'enter.phone.number': 'أدخل رقم الهاتف',

            // Errors
            'name.required.error': 'الاسم مطلوب',
            'phone.required.error': 'رقم الهاتف مطلوب',
            'phone.invalid.error': 'يرجى إدخال رقم هاتف صحيح'
        },

        he: {
            // Navigation
            'search.students.placeholder': 'חיפוש תלמידים...',
            'add.student': 'הוסף תלמיד',
            'loading.students': 'טוען תלמידים...',
            'no.matches.found': 'לא נמצאו תוצאות',
            'try.different.search': 'נסה מילת חיפוש אחרת',
            'no.students.yet': 'אין תלמידים עדיין',
            'click.add.student.start': 'לחץ על "הוסף תלמיד" כדי להתחיל',

            // Student Details
            'not.set': 'לא הוגדר',
            'started.label': 'התחיל:',
            'last.lesson.label': 'שיעור אחרון:',
            'ready.for.test': 'מוכן למבחן',
            'more.lessons.needed': 'צריך עוד {{count}} שיעורים',

            // Payment Status
            'paid.up': 'שולם',
            'owes.money': 'חייב כסף',
            'payment.overdue': 'תשלום באיחור',

            // Stats
            'balance.label': 'יתרה',
            'lessons.completed.label': 'שיעורים שהושלמו',
            'test.progress.label': 'התקדמות מבחן',

            // Actions
            'record.payment.button': 'רשום תשלום',
            'update.progress.button': 'עדכן התקדמות',

            // Lessons
            'recent.lessons.title': 'שיעורים אחרונים',
            'no.lessons.recorded': 'לא נרשמו שיעורים עדיין',
            'add.new.lesson.title': 'הוסף שיעור חדש',
            'view.all.lessons': 'הצג את כל השיעורים ({{count}})',
            'minutes.short': 'דק',

            // Form Labels
            'date.label': 'תאריך',
            'duration.minutes.label': 'משך (בדקות)',
            'cost.label': 'עלות',
            'notes.label': 'הערות',
            'name.label': 'שם',
            'phone.number.label': 'מספר טלפון',
            'mark.as.paid.checkbox': 'סמן כשולם',

            // Buttons
            'add.lesson.button': 'הוסף שיעור',
            'cancel.button': 'ביטול',
            'add.student.button': 'הוסף תלמיד',

            // Dialogs
            'add.new.student.title': 'הוסף תלמיד חדש',
            'progress.notes.title': 'הערות התקדמות',

            // Placeholders
            'enter.student.name': 'הכנס שם תלמיד',
            'enter.phone.number': 'הכנס מספר טלפון',

            // Errors
            'name.required.error': 'שם נדרש',
            'phone.required.error': 'מספר טלפון נדרש',
            'phone.invalid.error': 'אנא הכנס מספר טלפון תקין'
        },

        ru: {
            // Navigation
            'search.students.placeholder': 'Поиск учеников...',
            'add.student': 'Добавить ученика',
            'loading.students': 'Загрузка учеников...',
            'no.matches.found': 'Совпадений не найдено',
            'try.different.search': 'Попробуйте другой поисковый запрос',
            'no.students.yet': 'Учеников пока нет',
            'click.add.student.start': 'Нажмите "Добавить ученика", чтобы начать',

            // Student Details
            'not.set': 'Не установлено',
            'started.label': 'Начал:',
            'last.lesson.label': 'Последний урок:',
            'ready.for.test': 'Готов к экзамену',
            'more.lessons.needed': 'Нужно еще {{count}} уроков',

            // Payment Status
            'paid.up': 'Оплачено',
            'owes.money': 'Должен деньги',
            'payment.overdue': 'Просрочка платежа',

            // Stats
            'balance.label': 'Баланс',
            'lessons.completed.label': 'Уроков завершено',
            'test.progress.label': 'Прогресс экзамена',

            // Actions
            'record.payment.button': 'Записать платеж',
            'update.progress.button': 'Обновить прогресс',

            // Lessons
            'recent.lessons.title': 'Недавние уроки',
            'no.lessons.recorded': 'Уроки еще не записаны',
            'add.new.lesson.title': 'Добавить новый урок',
            'view.all.lessons': 'Показать все уроки ({{count}})',
            'minutes.short': 'мин',

            // Form Labels
            'date.label': 'Дата',
            'duration.minutes.label': 'Продолжительность (минуты)',
            'cost.label': 'Стоимость',
            'notes.label': 'Заметки',
            'name.label': 'Имя',
            'phone.number.label': 'Номер телефона',
            'mark.as.paid.checkbox': 'Отметить как оплаченный',

            // Buttons
            'add.lesson.button': 'Добавить урок',
            'cancel.button': 'Отмена',
            'add.student.button': 'Добавить ученика',

            // Dialogs
            'add.new.student.title': 'Добавить нового ученика',
            'progress.notes.title': 'Заметки о прогрессе',

            // Placeholders
            'enter.student.name': 'Введите имя ученика',
            'enter.phone.number': 'Введите номер телефона',

            // Errors
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
        return this.supportedLanguages[0]; // English
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
        document.documentElement.setAttribute('lang', language.code);
    }

    translate(key: string, params?: { [key: string]: any }): string {
        const currentLang = this.getCurrentLanguage().code;
        const translations = this.translations[currentLang] || this.translations['en'];
        let translation = translations[key] || key;

        // Handle interpolation like {{count}}
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