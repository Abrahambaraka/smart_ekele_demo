export interface Database {
  users: User[];
  schools: School[];
  school_years: SchoolYear[];
  classes: Class[];
  subjects: Subject[];
  students: Student[];
  teachers: Teacher[];
  teacher_subjects: TeacherSubject[];
  attendance: Attendance[];
  grades: Grade[];
  fees: Fee[];
  payments: Payment[];
  notifications: Notification[];
  notification_recipients: NotificationRecipient[];
  timetables: Timetable[];
  audit_logs: AuditLog[];
  settings: Setting[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'school_director' | 'teacher';
  profile_image?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  province?: string;
  country: string;
  phone?: string;
  email?: string;
  logo?: string;
  director_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SchoolYear {
  id: string;
  school_id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  is_current: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  level?: string;
  section?: string;
  capacity: number;
  school_year_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code?: string;
  description?: string;
  coefficient: number;
  created_at: Date;
  updated_at: Date;
}

export interface Student {
  id: string;
  user_id?: string;
  school_id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  gender: 'M' | 'F';
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  class_id?: string;
  enrollment_date?: Date;
  status: 'active' | 'suspended' | 'graduated' | 'expelled';
  medical_info?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  photo?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Teacher {
  id: string;
  user_id: string;
  school_id: string;
  teacher_number: string;
  qualification?: string;
  specialization?: string;
  hire_date?: Date;
  salary?: number;
  status: 'active' | 'on_leave' | 'resigned' | 'terminated';
  created_at: Date;
  updated_at: Date;
}

export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  school_year_id?: string;
  created_at: Date;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  recorded_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  school_year_id: string;
  exam_type: 'interrogation' | 'devoir' | 'examen_1' | 'examen_2' | 'examen_final';
  score: number;
  max_score: number;
  exam_date?: Date;
  remarks?: string;
  teacher_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Fee {
  id: string;
  school_id: string;
  name: string;
  description?: string;
  amount: number;
  fee_type: 'frais_scolaires' | 'inscription' | 'uniforme' | 'examen' | 'autre';
  class_id?: string;
  school_year_id?: string;
  is_mandatory: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  student_id: string;
  fee_id: string;
  amount_paid: number;
  payment_date: Date;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'check';
  reference_number?: string;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  remarks?: string;
  recorded_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  school_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'announcement';
  target_audience: 'all' | 'teachers' | 'students' | 'parents' | 'specific_class';
  class_id?: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  sent_by?: string;
  created_at: Date;
}

export interface NotificationRecipient {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

export interface Timetable {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id?: string;
  day_of_week: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi';
  start_time: string;
  end_time: string;
  room?: string;
  school_year_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  school_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface Setting {
  id: string;
  school_id: string;
  setting_key: string;
  setting_value?: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query types
export interface QueryFilters {
  school_id?: string;
  class_id?: string;
  student_id?: string;
  teacher_id?: string;
  school_year_id?: string;
  status?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Statistics types
export interface StudentStatistics {
  total_students: number;
  active_students: number;
  by_class: { class_name: string; count: number }[];
  by_gender: { gender: string; count: number }[];
}

export interface PaymentStatistics {
  total_collected: number;
  total_pending: number;
  by_payment_method: { method: string; amount: number }[];
  monthly_revenue: { month: string; amount: number }[];
}

export interface AttendanceStatistics {
  total_present: number;
  total_absent: number;
  total_late: number;
  attendance_rate: number;
}

export interface GradeStatistics {
  average_score: number;
  highest_score: number;
  lowest_score: number;
  passing_rate: number;
  by_subject: { subject_name: string; average: number }[];
}
