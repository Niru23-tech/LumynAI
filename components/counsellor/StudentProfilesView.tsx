import React, { useState, useEffect, useMemo } from 'react';
import { User, Appointment, JournalEntry, Role, AppointmentStatus } from '../../types';
import { getUsers, getStudentAppointments, getStudentJournal } from '../../services/api';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '../shared/icons/Icons';

const StudentProfilesView: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getUsers(Role.STUDENT).then(setStudents);
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            setLoading(true);
            // NOTE: Journal entries are now private to students by default for security.
            // This component will show an empty journal list unless RLS policies are adjusted.
            Promise.all([
                getStudentAppointments(selectedStudent.id),
                getStudentJournal(selectedStudent.id).catch(() => []) // Gracefully fail if no permission
            ]).then(([appts, journals]) => {
                setAppointments(appts);
                setJournalEntries(journals);
                setLoading(false);
            });
        } else {
            setAppointments([]);
            setJournalEntries([]);
        }
    }, [selectedStudent]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [students, searchTerm]);

    const getStatusIcon = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.CONFIRMED:
                return <CheckCircleIcon className="text-green-500" />;
            case AppointmentStatus.PENDING:
                return <ClockIcon className="text-yellow-500" />;
            case AppointmentStatus.REJECTED:
                return <XCircleIcon className="text-red-500" />;
            default:
                return <ClockIcon className="text-gray-500" />;
        }
    }

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Student List */}
            <div className="flex flex-col w-1/3 border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold">Students</h2>
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 mt-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredStudents.map(student => (
                        <div
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedStudent?.id === student.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                        >
                            <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 mr-3 rounded-full" />
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-white">{student.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Profile View */}
            <div className="flex flex-col w-2/3">
                {selectedStudent ? (
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
                            <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-20 h-20 mr-4 rounded-full" />
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedStudent.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{selectedStudent.email}</p>
                            </div>
                        </div>

                        {loading ? <p>Loading details...</p> :
                            <div>
                                {/* Appointment History */}
                                <div className="mb-8">
                                    <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Appointment History</h4>
                                    <div className="space-y-3">
                                        {appointments.length > 0 ? appointments.map(app => (
                                            <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md dark:bg-gray-900/50">
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200">With {app.counsellorName}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{app.dateTime.toLocaleString()}</p>
                                                </div>
                                                <span className="flex items-center text-sm font-medium">
                                                    {getStatusIcon(app.status)} <span className="ml-1.5">{app.status}</span>
                                                </span>
                                            </div>
                                        )) : <p className="text-gray-500 dark:text-gray-400">No appointments found.</p>}
                                    </div>
                                </div>

                                {/* Journal Entries */}
                                <div>
                                    <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Journal Entries</h4>
                                    <div className="space-y-4">
                                        {journalEntries.length > 0 ? journalEntries.map(entry => (
                                            <div key={entry.id} className="p-4 border rounded-lg dark:border-gray-700">
                                                <h5 className="font-semibold text-gray-800 dark:text-white">{entry.title}</h5>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{entry.createdAt.toLocaleDateString()}</p>
                                                <p className="text-gray-700 dark:text-gray-300">{entry.content}</p>
                                            </div>
                                        )) : <p className="text-gray-500 dark:text-gray-400">No journal entries found. (Note: Journals are private by default).</p>}
                                    </div>
                                </div>
                            </div>
                        }

                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a student to view their profile
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfilesView;