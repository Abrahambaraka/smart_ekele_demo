export enum Role {
  SCHOOL_DIRECTOR = 'school_director',
  TEACHER = 'teacher'
}
export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: Role;
  school_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface School {
  id: number;
  name: string;
  directorId: number;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  status: 'Active' | 'Inactive';
}

export enum ClassLevel {
    SIXIEME = "6ème",
    CINQUIEME = "5ème",
    QUATRIEME = "4ème",
    TROISIEME = "3ème",
    SECONDE = "Seconde",
    PREMIERE = "Première",
    TERMINALE = "Terminale"
}

export interface Class {
    id: number;
    name: string;
    level: ClassLevel;
    teacherId: number;
    studentCount: number;
}

export enum StudentStatus {
    ACTIVE = "Active",
    TRANSFERRED = "Transferred",
    GRADUATED = "Graduated",
    INACTIVE = "Inactive"
}

export interface Student {
    id: number;
    name: string;
    classId: number;
    status: StudentStatus;
    enrollmentDate: string;
    phoneNumber: string;
    parentPhoneNumber: string;
    parentAddress: string;
}

export enum PaymentStatus {
    PAID = "Payé",
    PARTIAL = "Partiel",
    LATE = "En retard",
    EXEMPTED = "Exempté"
}

export interface Payment {
    id: number;
    studentId: number;
    amount: number;
    status: PaymentStatus;
    dueDate: string;
    description: string;
}

export interface Notification {
    id: number;
    title: string;
    content: string;
    date: string;
    read: boolean;
    sender: string;
    target: string;
}

export interface Event {
    id: number;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    class?: string; // Optional, if event is specific to a class
}
