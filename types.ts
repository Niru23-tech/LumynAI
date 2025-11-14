
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'counselor' | 'student';
  timestamp: string;
  seen?: boolean;
}

export enum ConcernLevel {
  High = 'High Concern',
  Moderate = 'Moderate Concern',
  Low = 'Low Concern',
}

export interface Student {
  id: string;
  name: string;
  email: string;
  concernScore: number;
  concernLevel: ConcernLevel;
  lastMessage: string;
  role: 'student';
}

export interface Counselor {
    id: string;
    name: string;
    email: string;
    role: 'counselor';
}

export type User = Student | Counselor;

export interface MoodDataPoint {
  name: string;
  mood: number; 
}

export enum AppointmentStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Rejected = 'Rejected',
    Completed = 'Completed',
}

export interface Appointment {
    id: string;
    studentId: string;
    counselorId: string;
    date: string; 
    time: string;
    status: AppointmentStatus;
    notes?: string;
}

export interface JournalEntry {
    id: string;
    studentId: string;
    title: string;
    content: string;
    date: string; 
}
