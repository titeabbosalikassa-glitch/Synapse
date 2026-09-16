export type UserRole = 'admin' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subject?: string;
  subjects?: string[]; // Up to 3 subjects taught by the teacher
  phone?: string;
  password?: string;
}

export type ClassLevel =
  | '6e'
  | '5e'
  | '4e'
  | '3e'
  | 'Seconde LE'
  | 'Seconde S'
  | 'Première A1'
  | 'Première A2'
  | 'Première B'
  | 'Première S'
  | 'Terminale A1'
  | 'Terminale A2'
  | 'Terminale B'
  | 'Terminale C'
  | 'Terminale D';

export type Stream = 'Collège' | 'LE' | 'S' | 'A1' | 'A2' | 'B' | 'C' | 'D' | 'Général';

export type SubjectName =
  | 'Mathématiques'
  | 'Physique'
  | 'Chimie'
  | 'SVT'
  | 'Informatique'
  | 'Français'
  | 'Anglais'
  | 'Mandarin'
  | 'Allemand'
  | 'Italien';

export interface SubjectConfig {
  id: string;
  name: SubjectName;
  code: string;
  category: 'Sciences' | 'Langues & Humanités';
  color: string;
}

export interface Student {
  id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  classLevel: ClassLevel;
  stream: Stream;
  subjects: string[]; // Subject names
  parentPhone?: string;
  parentEmail?: string;
  notes?: string;
  createdAt: string;
}

export type NotionAssessmentStatus = 'studied' | 'assimilated' | 'to_reinforce';

export interface NotionStatus {
  id: string;
  studentId: string;
  teacherId: string;
  subject: SubjectName;
  chapter: string;
  notion: string;
  status: NotionAssessmentStatus;
  updatedAt: string;
  sessionCount: number;
}

export interface SessionRating {
  understanding: number; // /20
  autonomy: number; // /20
  methodology: number; // /20
  engagement: number; // /20
  progression: number; // /20
  calculatedScore: number; // /100 sum
}

export interface Session {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  durationMinutes: number;
  subjectId: string;
  chapter: string;
  notion: string;
  objective: string;
  contentWorked?: string;
  appreciation: string;
  rating: SessionRating;
  createdAt: string;
}

export type ObjectiveStatus = 'not_started' | 'in_progress' | 'completed';

export interface Objective {
  id: string;
  studentId: string;
  teacherId: string;
  title: string;
  description: string;
  targetDate: string;
  status: ObjectiveStatus;
  progressPercent: number; // 0 to 100
  createdAt: string;
}

export interface ResourceDocument {
  id: string;
  teacherId: string;
  studentId?: string;
  title: string;
  chapter: string;
  subjectId: string;
  classLevel: ClassLevel;
  stream: Stream;
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  uploadedAt: string;
  description?: string;
}

export interface EvaluationExercise {
  id: string;
  title: string;
  points: number;
  statement: string;
  solution: string;
}

export interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  classLevel: ClassLevel;
  stream: Stream;
  subject: SubjectName;
  notionsEvaluated: string[];
  title: string;
  totalScore: number; // 20
  instructions: string;
  exercises: EvaluationExercise[];
  createdAt: string;
}

export type AccountRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AccountRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  subjects?: string[]; // Up to 3 subjects
  phone?: string;
  password?: string;
  status: AccountRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
}

export interface AdminNotification {
  id: string;
  type: 'student_added' | 'session_added' | 'system' | 'account_registration';
  title: string;
  message: string;
  teacherId?: string;
  teacherName?: string;
  studentId?: string;
  studentName?: string;
  accountRequestId?: string;
  accountRequestData?: {
    name: string;
    email: string;
    subject: string;
    subjects?: string[];
    phone?: string;
    status: AccountRequestStatus;
  };
  date: string;
  time: string;
  timestamp: string;
  read: boolean;
}

