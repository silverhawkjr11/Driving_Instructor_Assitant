// src/app/services/translation.service.ts
import { Injectable, signal, computed } from '@angular/core';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface TranslationDictionary {
  [key: string]: {
    [languageCode: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' }
  ];

  private currentLanguageSignal = signal<Language>(this.supportedLanguages[0]);

  private translations: TranslationDictionary = {
    // Navigation & General
    'my_students': {
      en: 'My Students',
      he: 'התלמידים שלי',
      ar: 'طلابي',
      es: 'Mis Estudiantes',
      fr: 'Mes Étudiants'
    },
    'dashboard': {
      en: 'Dashboard',
      he: 'לוח בקרה',
      ar: 'لوحة القيادة',
      es: 'Panel',
      fr: 'Tableau de bord'
    },
    'schedule': {
      en: 'Schedule',
      he: 'לוח זמנים',
      ar: 'الجدول',
      es: 'Horario',
      fr: 'Planning'
    },
    'payments': {
      en: 'Payments',
      he: 'תשלומים',
      ar: 'المدفوعات',
      es: 'Pagos',
      fr: 'Paiements'
    },

    // Student Management
    'add_student': {
      en: 'Add Student',
      he: 'הוסף תלמיד',
      ar: 'إضافة طالب',
      es: 'Agregar Estudiante',
      fr: 'Ajouter Étudiant'
    },
    'search_students': {
      en: 'Search students...',
      he: 'חפש תלמידים...',
      ar: 'البحث عن الطلاب...',
      es: 'Buscar estudiantes...',
      fr: 'Rechercher des étudiants...'
    },
    'student_name': {
      en: 'Student Name',
      he: 'שם התלמיד',
      ar: 'اسم الطالب',
      es: 'Nombre del Estudiante',
      fr: 'Nom de l\'Étudiant'
    },
    'phone_number': {
      en: 'Phone Number',
      he: 'מספר טלפון',
      ar: 'رقم الهاتف',
      es: 'Número de Teléfono',
      fr: 'Numéro de Téléphone'
    },
    'name': {
      en: 'Name',
      he: 'שם',
      ar: 'الاسم',
      es: 'Nombre',
      fr: 'Nom'
    },
    'phone': {
      en: 'Phone',
      he: 'טלפון',
      ar: 'هاتف',
      es: 'Teléfono',
      fr: 'Téléphone'
    },

    // Lessons
    'lessons': {
      en: 'Lessons',
      he: 'שיעורים',
      ar: 'الدروس',
      es: 'Lecciones',
      fr: 'Leçons'
    },
    'add_lesson': {
      en: 'Add Lesson',
      he: 'הוסף שיעור',
      ar: 'إضافة درس',
      es: 'Agregar Lección',
      fr: 'Ajouter Leçon'
    },
    'date': {
      en: 'Date',
      he: 'תאריך',
      ar: 'التاريخ',
      es: 'Fecha',
      fr: 'Date'
    },
      'start_time': {
        en: 'Start Time',
        he: 'שעת התחלה',
        ar: 'وقت البداية',
        es: 'Hora de Inicio',
        fr: 'Heure de Début'
    },
    'duration': {
      en: 'Duration',
      he: 'משך זמן',
      ar: 'المدة',
      es: 'Duración',
      fr: 'Durée'
    },
    'duration_minutes': {
      en: 'Duration (minutes)',
      he: 'משך זמן (דקות)',
      ar: 'المدة (دقائق)',
      es: 'Duración (minutos)',
      fr: 'Durée (minutes)'
    },
    'notes': {
      en: 'Notes',
      he: 'הערות',
      ar: 'ملاحظات',
      es: 'Notas',
      fr: 'Notes'
    },
    'cost': {
      en: 'Cost',
      he: 'עלות',
      ar: 'التكلفة',
      es: 'Costo',
      fr: 'Coût'
    },
    'mark_as_paid': {
      en: 'Mark as Paid',
      he: 'סמן כמשולם',
      ar: 'تحديد كمدفوع',
      es: 'Marcar como Pagado',
      fr: 'Marquer comme Payé'
    },
    'recent_lessons': {
      en: 'Recent Lessons',
      he: 'שיעורים אחרונים',
      ar: 'الدروس الأخيرة',
      es: 'Lecciones Recientes',
      fr: 'Leçons Récentes'
    },
    'no_lessons': {
      en: 'No lessons recorded yet',
      he: 'עדיין לא נרשמו שיעורים',
      ar: 'لم يتم تسجيل دروس بعد',
      es: 'Aún no se han registrado lecciones',
      fr: 'Aucune leçon enregistrée'
    },

    // Payment & Financial
    'balance': {
      en: 'Balance',
      he: 'יתרה',
      ar: 'الرصيد',
      es: 'Balance',
      fr: 'Solde'
    },
    'balance_owed': {
      en: 'Balance Owed',
      he: 'יתרת חוב',
      ar: 'الرصيد المستحق',
      es: 'Saldo Adeudado',
      fr: 'Solde Dû'
    },
    'credit': {
      en: 'Credit',
      he: 'זכות',
      ar: 'ائتمان',
      es: 'Crédito',
      fr: 'Crédit'
    },
    'record_payment': {
      en: 'Record Payment',
      he: 'רשום תשלום',
      ar: 'تسجيل دفعة',
      es: 'Registrar Pago',
      fr: 'Enregistrer Paiement'
    },
    'paid_up': {
      en: 'Paid Up',
      he: 'משולם',
      ar: 'مدفوع',
      es: 'Pagado',
      fr: 'Payé'
    },
    'owes_money': {
      en: 'Owes Money',
      he: 'חייב כסף',
      ar: 'يدين بالمال',
      es: 'Debe Dinero',
      fr: 'Doit de l\'Argent'
    },
    'overdue': {
      en: 'Overdue',
      he: 'פיגור',
      ar: 'متأخر',
      es: 'Vencido',
      fr: 'En Retard'
    },

    // Add these translations to your translation.service.ts translations object

    // Calendar specific translations
    'schedule_lesson': {
      en: 'Schedule Lesson',
      he: 'קבע שיעור',
      ar: 'جدولة درس',
      es: 'Programar Lección',
      fr: 'Programmer Leçon'
    },
    'today': {
      en: 'Today',
      he: 'היום',
      ar: 'اليوم',
      es: 'Hoy',
      fr: 'Aujourd\'hui'
    },
    'day': {
      en: 'Day',
      he: 'יום',
      ar: 'يوم',
      es: 'Día',
      fr: 'Jour'
    },
    'week': {
      en: 'Week',
      he: 'שבוע',
      ar: 'أسبوع',
      es: 'Semana',
      fr: 'Semaine'
    },
    'month': {
      en: 'Month',
      he: 'חודש',
      ar: 'شهر',
      es: 'Mes',
      fr: 'Mois'
    },
    'time': {
      en: 'Time',
      he: 'זמן',
      ar: 'وقت',
      es: 'Hora',
      fr: 'Heure'
    },
    'quick_navigation': {
      en: 'Quick Navigation',
      he: 'ניווט מהיר',
      ar: 'التنقل السريع',
      es: 'Navegación Rápida',
      fr: 'Navigation Rapide'
    },
    'student_name_required': {
      en: 'Student name is required',
      he: 'שם התלמיד נדרש',
      ar: 'اسم الطالب مطلوب',
      es: 'Se requiere nombre del estudiante',
      fr: 'Le nom de l\'étudiant est requis'
    },
    'student_not_found': {
      en: 'Student not found',
      he: 'תלמיד לא נמצא',
      ar: 'لم يتم العثور على الطالب',
      es: 'Estudiante no encontrado',
      fr: 'Étudiant non trouvé'
    },
    'lesson_notes': {
      en: 'Lesson notes:',
      he: 'הערות שיעור:',
      ar: 'ملاحظات الدرس:',
      es: 'Notas de la lección:',
      fr: 'Notes de leçon:'
    },
    'duration_label': {
      en: 'Duration',
      he: 'משך זמן',
      ar: 'المدة',
      es: 'Duración',
      fr: 'Durée'
    },
    'minutes': {
      en: 'minutes',
      he: 'דקות',
      ar: 'دقائق',
      es: 'minutos',
      fr: 'minutes'
    },
    'failed_to_create_lesson': {
      en: 'Failed to create lesson',
      he: 'נכשל ביצירת שיעור',
      ar: 'فشل في إنشاء الدرس',
      es: 'Error al crear lección',
      fr: 'Échec de création de leçon'
    },
    'failed_to_update_lesson': {
      en: 'Failed to update lesson',
      he: 'נכשל בעדכון שיעור',
      ar: 'فشل في تحديث الدرس',
      es: 'Error al actualizar lección',
      fr: 'Échec de mise à jour de leçon'
},

// Add these translations to your translation service translations object:

  'theme_settings': {
    en: 'Theme Settings',
    he: 'הגדרות ערכת נושא',
    ar: 'إعدادات المظهر',
    es: 'Configuración del Tema',
    fr: 'Paramètres du Thème'
  },
  'choose_theme_subtitle': {
    en: 'Choose your preferred color theme',
    he: 'בחר את ערכת הצבעים המועדפת עליך',
    ar: 'اختر مظهر الألوان المفضل لديك',
    es: 'Elige tu tema de colores preferido',
    fr: 'Choisissez votre thème de couleurs préféré'
  },
  'select_theme': {
    en: 'Select Theme',
    he: 'בחר ערכת נושא',
    ar: 'اختر المظهر',
    es: 'Seleccionar Tema',
    fr: 'Sélectionner le Thème'
  },
  'current_theme': {
    en: 'Current Theme',
    he: 'ערכת נושא נוכחית',
    ar: 'المظهر الحالي',
    es: 'Tema Actual',
    fr: 'Thème Actuel'
  },
  'theme_applies_all_pages': {
    en: 'Theme applies to all pages',
    he: 'ערכת הנושא חלה על כל הדפים',
    ar: 'يطبق المظهر على جميع الصفحات',
    es: 'El tema se aplica a todas las páginas',
    fr: 'Le thème s\'applique à toutes les pages'
  },
  'language_settings': {
    en: 'Language Settings',
    he: 'הגדרות שפה',
    ar: 'إعدادات اللغة',
    es: 'Configuración de Idioma',
    fr: 'Paramètres de Langue'
  },
  'choose_language_subtitle': {
    en: 'Choose your preferred language',
    he: 'בחר את השפה המועדפת עליך',
    ar: 'اختر لغتك المفضلة',
    es: 'Elige tu idioma preferido',
    fr: 'Choisissez votre langue préférée'
  },
  'select_language': {
    en: 'Select Language',
    he: 'בחר שפה',
    ar: 'اختر اللغة',
    es: 'Seleccionar Idioma',
    fr: 'Sélectionner la Langue'
  },
  'current_language': {
    en: 'Current Language',
    he: 'שפה נוכחית',
    ar: 'اللغة الحالية',
    es: 'Idioma Actual',
    fr: 'Langue Actuelle'
  },
  'language_reload_note': {
    en: 'Page will reload when language is changed',
    he: 'הדף יירענן כשהשפה תשתנה',
    ar: 'ستعاد تحميل الصفحة عند تغيير اللغة',
    es: 'La página se recargará al cambiar el idioma',
    fr: 'La page se rechargera lors du changement de langue'
  },

    // Progress & Test Readiness
    'lessons_completed': {
      en: 'Lessons Completed',
      he: 'שיעורים שהושלמו',
      ar: 'الدروس المكتملة',
      es: 'Lecciones Completadas',
      fr: 'Leçons Terminées'
    },
    'test_progress': {
      en: 'Test Progress',
      he: 'התקדמות למבחן',
      ar: 'تقدم الاختبار',
      es: 'Progreso del Examen',
      fr: 'Progrès du Test'
    },
    'ready_for_test': {
      en: 'Ready for Test',
      he: 'מוכן למבחן',
      ar: 'جاهز للاختبار',
      es: 'Listo para Examen',
      fr: 'Prêt pour le Test'
    },
    'more_needed': {
      en: 'more needed',
      he: 'נדרשים עוד',
      ar: 'مطلوب المزيد',
      es: 'más necesarios',
      fr: 'de plus nécessaires'
    },
    'update_progress': {
      en: 'Update Progress',
      he: 'עדכן התקדמות',
      ar: 'تحديث التقدم',
      es: 'Actualizar Progreso',
      fr: 'Mettre à jour Progrès'
    },
    'progress_notes': {
      en: 'Progress Notes',
      he: 'הערות התקדמות',
      ar: 'ملاحظات التقدم',
      es: 'Notas de Progreso',
      fr: 'Notes de Progrès'
    },

    // Actions & Buttons
    'add': {
      en: 'Add',
      he: 'הוסף',
      ar: 'إضافة',
      es: 'Agregar',
      fr: 'Ajouter'
    },
    'cancel': {
      en: 'Cancel',
      he: 'ביטול',
      ar: 'إلغاء',
      es: 'Cancelar',
      fr: 'Annuler'
    },
    'save': {
      en: 'Save',
      he: 'שמור',
      ar: 'حفظ',
      es: 'Guardar',
      fr: 'Sauvegarder'
    },
    'edit': {
      en: 'Edit',
      he: 'ערוך',
      ar: 'تحرير',
      es: 'Editar',
      fr: 'Modifier'
    },
    'delete': {
      en: 'Delete',
      he: 'מחק',
      ar: 'حذف',
      es: 'Eliminar',
      fr: 'Supprimer'
    },
    'refresh': {
      en: 'Refresh',
      he: 'רענן',
      ar: 'تحديث',
      es: 'Actualizar',
      fr: 'Actualiser'
    },
    'view_all': {
      en: 'View All',
      he: 'צפה בהכל',
      ar: 'عرض الكل',
      es: 'Ver Todo',
      fr: 'Voir Tout'
    },

    // Status & General
    'loading': {
      en: 'Loading...',
      he: 'טוען...',
      ar: 'جاري التحميل...',
      es: 'Cargando...',
      fr: 'Chargement...'
    },
    'loading_students': {
      en: 'Loading students...',
      he: 'טוען תלמידים...',
      ar: 'تحميل الطلاب...',
      es: 'Cargando estudiantes...',
      fr: 'Chargement des étudiants...'
    },
    'no_matches': {
      en: 'No matches found',
      he: 'לא נמצאו תוצאות',
      ar: 'لم يتم العثور على تطابقات',
      es: 'No se encontraron coincidencias',
      fr: 'Aucune correspondance trouvée'
    },
    'try_different_search': {
      en: 'Try a different search term',
      he: 'נסה מילת חיפוש אחרת',
      ar: 'جرب مصطلح بحث مختلف',
      es: 'Prueba un término de búsqueda diferente',
      fr: 'Essayez un autre terme de recherche'
    },
    'no_students_yet': {
      en: 'No students yet',
      he: 'עדיין אין תלמידים',
      ar: 'لا يوجد طلاب بعد',
      es: 'Aún no hay estudiantes',
      fr: 'Pas encore d\'étudiants'
    },
    'click_add_student': {
      en: 'Click "Add Student" to get started',
      he: 'לחץ על "הוסף תלמיד" כדי להתחיל',
      ar: 'انقر على "إضافة طالب" للبدء',
      es: 'Haz clic en "Agregar Estudiante" para comenzar',
      fr: 'Cliquez sur "Ajouter Étudiant" pour commencer'
    },

    // Form Validation
    'name_required': {
      en: 'Name is required',
      he: 'שם נדרש',
      ar: 'الاسم مطلوب',
      es: 'El nombre es requerido',
      fr: 'Le nom est requis'
    },
    'phone_required': {
      en: 'Phone number is required',
      he: 'מספר טלפון נדרש',
      ar: 'رقم الهاتف مطلوب',
      es: 'El número de teléfono es requerido',
      fr: 'Le numéro de téléphone est requis'
    },
    'valid_phone': {
      en: 'Please enter a valid phone number',
      he: 'אנא הזן מספר טלפון תקין',
      ar: 'يرجى إدخال رقم هاتف صحيح',
      es: 'Por favor ingrese un número de teléfono válido',
      fr: 'Veuillez saisir un numéro de téléphone valide'
    },

    // Time-related
    'started': {
      en: 'Started',
      he: 'התחיל',
      ar: 'بدأ',
      es: 'Comenzó',
      fr: 'Commencé'
    },
    'last_lesson': {
      en: 'Last Lesson',
      he: 'שיעור אחרון',
      ar: 'آخر درس',
      es: 'Última Lección',
      fr: 'Dernière Leçon'
    },
    'not_set': {
      en: 'Not set',
      he: 'לא הוגדר',
      ar: 'غير محدد',
      es: 'No establecido',
      fr: 'Non défini'
    },
    'driving_instructor_app': {
      en: 'Driving Instructor',
      he: 'מורה נהיגה',
      ar: 'مدرب القيادة',
      es: 'Instructor de Manejo',
      fr: 'Moniteur de Conduite'
    },
    'settings': {
      en: 'Settings',
      he: 'הגדרות',
      ar: 'الإعدادات',
      es: 'Configuración',
      fr: 'Paramètres'
    },
    'logout': {
      en: 'Logout',
      he: 'התנתק',
      ar: 'تسجيل الخروج',
      es: 'Cerrar Sesión',
      fr: 'Déconnexion'
    }
  };

  // Public observables
  currentLanguage$ = computed(() => this.currentLanguageSignal());

  constructor() {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('driving-instructor-language');
    if (savedLanguage) {
      const language = this.supportedLanguages.find(lang => lang.code === savedLanguage);
      if (language) {
        this.currentLanguageSignal.set(language);
      }
    }
  }

  setLanguage(language: Language): void {
    this.currentLanguageSignal.set(language);
    localStorage.setItem('driving-instructor-language', language.code);

    // Set document direction for RTL languages
    if (language.code === 'he' || language.code === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = language.code;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language.code;
    }
  }

  translate(key: string, params?: { [key: string]: string | number }): string {
    const currentLang = this.currentLanguageSignal().code;
    const translation = this.translations[key]?.[currentLang] || this.translations[key]?.['en'] || key;

    // Replace parameters if provided
    if (params) {
      return Object.keys(params).reduce((result, param) => {
        return result.replace(`{{${param}}}`, String(params[param]));
      }, translation);
    }

    return translation;
  }

  // Helper method to get current language code
  getCurrentLanguageCode(): string {
    return this.currentLanguageSignal().code;
  }

  // Helper method to check if current language is RTL
  isRTL(): boolean {
    const currentLang = this.currentLanguageSignal().code;
    return currentLang === 'he' || currentLang === 'ar';
  }
}
