
import { Student, Counselor, Appointment, JournalEntry, ConcernLevel, AppointmentStatus } from '../types';

export const mockStudents: Student[] = [
  { id: 'student-1', name: 'Alex Johnson', email: 'alex@school.edu', concernScore: -0.85, concernLevel: ConcernLevel.High, lastMessage: "I'm feeling really overwhelmed with exams...", role: 'student' },
  { id: 'student-2', name: 'Ben Carter', email: 'ben@school.edu', concernScore: -0.42, concernLevel: ConcernLevel.Moderate, lastMessage: "It's just been a tough week, I guess.", role: 'student' },
  { id: 'student-3', name: 'Sophia Rodriguez', email: 'sophia@school.edu', concernScore: -0.91, concernLevel: ConcernLevel.High, lastMessage: "I don't know if I can handle the pressure anymore.", role: 'student' },
  { id: 'student-4', name: 'Liam Goldberg', email: 'liam@school.edu', concernScore: -0.15, concernLevel: ConcernLevel.Low, lastMessage: 'Feeling a bit stressed but managing.', role: 'student' },
];

export const mockCounselors: Counselor[] = [
    { id: 'counselor-1', name: 'Dr. Emily Vance', email: 'evance@school.edu', role: 'counselor' },
    { id: 'counselor-2', name: 'Mr. David Chen', email: 'dchen@school.edu', role: 'counselor' },
];

export const mockAppointments: Appointment[] = [
    { id: 'appt-1', studentId: 'student-1', counselorId: 'counselor-1', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), time: '10:00 AM', status: AppointmentStatus.Confirmed, notes: 'Feeling stressed about finals.' },
    { id: 'appt-2', studentId: 'student-2', counselorId: 'counselor-1', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), time: '02:00 PM', status: AppointmentStatus.Pending, notes: 'Need to talk about class performance.' },
    { id: 'appt-3', studentId: 'student-3', counselorId: 'counselor-2', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), time: '11:00 AM', status: AppointmentStatus.Completed },
    { id: 'appt-4', studentId: 'student-1', counselorId: 'counselor-2', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), time: '09:00 AM', status: AppointmentStatus.Rejected },
];

export const mockJournalEntries: JournalEntry[] = [
    { id: 'journal-1', studentId: 'student-1', title: 'Overwhelmed Today', content: 'Finals are coming up and I feel like I can\'t keep up. The pressure is immense and I barely slept last night worrying about my calculus exam.', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'journal-2', studentId: 'student-1', title: 'A small victory', content: 'I managed to finish my history paper ahead of schedule. It feels good to have one less thing to worry about. Maybe I can handle this after all.', date: new Date().toISOString() },
    { id: 'journal-3', studentId: 'student-2', title: 'Feeling a bit down', content: 'Not much to say today. Just feeling a bit disconnected from everything. The week has been long.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'journal-4', studentId: 'student-3', title: 'The weight is too much', content: 'Every day feels heavier than the last. I pretend I\'m fine but I\'m really not. I don\'t know who to talk to about this.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];
