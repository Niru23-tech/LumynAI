
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Student, ConcernLevel, Appointment, AppointmentStatus, JournalEntry } from '../types';
import { useAuth } from '../hooks/useAuth';
import { mockStudents, mockAppointments, mockJournalEntries } from '../data/mockData';

const ConcernBadge: React.FC<{ level: ConcernLevel; score: number }> = ({ level, score }) => {
    const baseClasses = "inline-flex items-center justify-center overflow-hidden rounded-full h-8 px-3 text-xs font-semibold";
    let concernClasses = "";
    switch (level) {
        case ConcernLevel.High: concernClasses = "bg-high-concern-bg text-high-concern-text"; break;
        case ConcernLevel.Moderate: concernClasses = "bg-moderate-concern-bg text-moderate-concern-text"; break;
        case ConcernLevel.Low: concernClasses = "bg-low-concern-bg text-low-concern-text"; break;
    }
    return <div className={`${baseClasses} ${concernClasses}`}><span>{level} ({score.toFixed(2)})</span></div>;
};

type CounselorView = 'dashboard' | 'requests' | 'schedule' | 'students';

const CounselorDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<CounselorView>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [appointments, setAppointments] = useState(mockAppointments);

    const handleUpdateAppointment = (id: string, status: AppointmentStatus) => {
        setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status } : appt));
        // Also update the master list in a real app
        const index = mockAppointments.findIndex(a => a.id === id);
        if (index > -1) mockAppointments[index].status = status;
    };

    const handleLogout = () => {
      logout();
      navigate('/');
    };

    const renderView = () => {
        switch (currentView) {
            case 'requests': return <AppointmentRequestsView counselorId={user!.id} appointments={appointments} onUpdate={handleUpdateAppointment} />;
            case 'schedule': return <ScheduleView counselorId={user!.id} appointments={appointments} />;
            case 'students': return <StudentsView searchTerm={searchTerm} />;
            case 'dashboard':
            default: return <DashboardSummaryView counselorId={user!.id} appointments={appointments} />;
        }
    };
    
    return (
        <div className="font-display bg-counselor-background-light dark:bg-background-dark counselor-dashboard">
            <div className="relative flex h-auto min-h-screen w-full flex-col">
                <div className="layout-container flex h-full grow flex-col">
                    <div className="flex flex-1 justify-center py-5 sm:px-6 lg:px-8">
                        <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 gap-8">
                            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-neutral-light dark:border-neutral-dark px-6 py-4">
                                <Link to="/" className="flex items-center gap-4 text-text-light dark:text-text-dark">
                                    <div className="size-6 text-counselor-primary"><span className="material-symbols-outlined !text-3xl">psychology</span></div>
                                    <h2 className="text-text-light dark:text-text-dark text-xl font-bold leading-tight tracking-[-0.015em]">MindEase</h2>
                                </Link>
                                <div className="hidden md:flex items-center gap-8">
                                    <a onClick={() => setCurrentView('dashboard')} className={`cursor-pointer text-text-light dark:text-text-dark text-sm font-medium leading-normal hover:text-counselor-primary dark:hover:text-counselor-primary transition-colors ${currentView === 'dashboard' && 'text-counselor-primary'}`}>Dashboard</a>
                                    <a onClick={() => setCurrentView('requests')} className={`cursor-pointer text-text-light dark:text-text-dark text-sm font-medium leading-normal hover:text-counselor-primary dark:hover:text-counselor-primary transition-colors ${currentView === 'requests' && 'text-counselor-primary'}`}>Requests</a>
                                    <a onClick={() => setCurrentView('schedule')} className={`cursor-pointer text-text-light dark:text-text-dark text-sm font-medium leading-normal hover:text-counselor-primary dark:hover:text-counselor-primary transition-colors ${currentView === 'schedule' && 'text-counselor-primary'}`}>Schedule</a>
                                    <a onClick={() => setCurrentView('students')} className={`cursor-pointer text-text-light dark:text-text-dark text-sm font-medium leading-normal hover:text-counselor-primary dark:hover:text-counselor-primary transition-colors ${currentView === 'students' && 'text-counselor-primary'}`}>Students</a>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCek1VBnSv7YJ3jVpPU4o42-yEOtlbRN-XT_ztAMLPeyt4CBJmUeGXsNXFZXlL_CFE4baPK5PsCY_4fSq2Qu8tgd_Pbio5ZQ3unPrF8AJnGVbKEy71GxEIRezeQ--2SAtiXDWrQVdTXwU2Rxs94d5i-Hb01b1J87ENllxIFSBi3gjcPVqh7Wrjs0gb6VFhGxDD_Mfo536j6-NPi76tVSkZFrJFqUgYp3ba7Tw4_CZ_3AW7swbuImkM_qzuTcSJZdY_Tm3bfu8F_rjo")` }}></div>
                                    <button onClick={handleLogout} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">logout</span>
                                    </button>
                                </div>
                            </header>
                            <main className="flex flex-col gap-6 px-4 py-3">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-text-light dark:text-text-dark text-3xl font-bold leading-tight tracking-[-0.03em]">Welcome back, {user?.name}</p>
                                        <p className="text-text-muted-light dark:text-text-muted-dark text-base font-normal leading-normal">Here's what's happening today.</p>
                                    </div>
                                    {currentView === 'students' && (
                                         <div className="relative w-full max-w-sm">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                            <input type="text" placeholder="Search for a student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-2 h-12 rounded-xl bg-white dark:bg-neutral-dark shadow-soft border-transparent focus:border-counselor-primary focus:ring-counselor-primary"/>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col rounded-xl">
                                    {renderView()}
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardSummaryView: React.FC<{counselorId: string, appointments: Appointment[]}> = ({counselorId, appointments}) => {
    const pendingRequests = appointments.filter(a => a.counselorId === counselorId && a.status === AppointmentStatus.Pending);
    const upcomingAppointments = appointments.filter(a => a.counselorId === counselorId && a.status === AppointmentStatus.Confirmed && new Date(a.date) >= new Date());
    
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-dark/20 p-6 rounded-xl shadow-soft">
            <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-4">Pending Requests</h3>
            <p className="text-5xl font-bold text-counselor-primary">{pendingRequests.length}</p>
            <p className="text-text-muted-light dark:text-text-muted-dark">students awaiting confirmation</p>
        </div>
        <div className="bg-white dark:bg-neutral-dark/20 p-6 rounded-xl shadow-soft">
            <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-4">Upcoming Sessions Today</h3>
            <p className="text-5xl font-bold text-counselor-primary">{upcomingAppointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}</p>
            <p className="text-text-muted-light dark:text-text-muted-dark">sessions scheduled for today</p>
        </div>
    </div>;
}

const AppointmentRequestsView: React.FC<{counselorId: string, appointments: Appointment[], onUpdate: (id: string, status: AppointmentStatus) => void}> = ({counselorId, appointments, onUpdate}) => {
    const requests = appointments.filter(a => a.counselorId === counselorId && a.status === AppointmentStatus.Pending);
    return <div className="bg-white dark:bg-neutral-dark/20 rounded-xl shadow-soft overflow-hidden">
        <h3 className="font-bold text-lg text-text-light dark:text-text-dark p-6">Appointment Requests</h3>
        {requests.length > 0 ? requests.map(req => {
            const student = mockStudents.find(s => s.id === req.studentId);
            return <div key={req.id} className="flex items-center justify-between p-4 border-t border-neutral-light dark:border-neutral-dark">
                <div>
                    <p className="font-semibold">{student?.name}</p>
                    <p className="text-sm text-text-muted-light">{new Date(req.date).toDateString()} at {req.time}</p>
                    <p className="text-sm italic text-text-muted-light mt-1">"{req.notes}"</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onUpdate(req.id, AppointmentStatus.Confirmed)} className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold">Confirm</button>
                    <button onClick={() => onUpdate(req.id, AppointmentStatus.Rejected)} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold">Reject</button>
                </div>
            </div>;
        }) : <p className="text-center py-8 text-text-muted-light">No pending requests.</p>}
    </div>;
};

const ScheduleView: React.FC<{counselorId: string, appointments: Appointment[]}> = ({counselorId, appointments}) => {
    const confirmedAppointments = appointments.filter(a => a.counselorId === counselorId && a.status === AppointmentStatus.Confirmed);
    return <div className="bg-white dark:bg-neutral-dark/20 p-6 rounded-xl shadow-soft">
        <h3 className="font-bold text-lg text-text-light dark:text-text-dark mb-4">My Schedule</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-muted-light">
            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
            {[...Array(35)].map((_, i) => {
                const day = i - 3; // Mocking calendar days for demonstration
                const dayAppointments = confirmedAppointments.filter(a => new Date(a.date).getDate() === new Date().getDate() + day - 1); // Simple logic for demo
                return <div key={i} className={`h-24 p-1 border border-neutral-light dark:border-neutral-dark rounded ${day <= 0 ? 'bg-neutral-light/50 dark:bg-neutral-dark/20' : ''}`}>
                    <span className="text-sm">{day > 0 ? day : ''}</span>
                    {dayAppointments.map(app => {
                        const student = mockStudents.find(s => s.id === app.studentId);
                        return <div key={app.id} className="text-xs bg-counselor-primary/20 text-counselor-primary p-1 rounded mt-1 truncate">{student?.name} @ {app.time}</div>
                    })}
                </div>
            })}
        </div>
    </div>;
};

const StudentsView: React.FC<{searchTerm: string}> = ({searchTerm}) => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentJournals, setStudentJournals] = useState<JournalEntry[]>([]);
    
    const filteredStudents = useMemo(() => {
        return mockStudents
            .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => b.concernScore - a.concernScore); // Sort by highest concern first
    }, [searchTerm]);

    const handleViewJournal = (student: Student) => {
        setSelectedStudent(student);
        setStudentJournals(mockJournalEntries.filter(j => j.studentId === student.id));
    };

    return <>
        <div className="bg-white dark:bg-neutral-dark/20 rounded-xl shadow-soft overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-counselor-background-light dark:bg-neutral-dark/50">
                        <th className="px-6 py-4 text-left text-text-light dark:text-text-dark text-sm font-medium leading-normal">Student Name</th>
                        <th className="px-6 py-4 text-left text-text-light dark:text-text-dark text-sm font-medium leading-normal">Concern Level</th>
                        <th className="px-6 py-4 text-left text-text-light dark:text-text-dark text-sm font-medium leading-normal">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light dark:divide-neutral-dark">
                    {filteredStudents.map(student => (
                        <tr key={student.id} className="hover:bg-counselor-background-light dark:hover:bg-neutral-dark/30 transition-colors">
                            <td className="h-[70px] px-6 py-2 text-text-light dark:text-text-dark text-sm font-medium leading-normal">{student.name}</td>
                            <td className="h-[70px] px-6 py-2 text-sm font-normal leading-normal">
                                <ConcernBadge level={student.concernLevel} score={student.concernScore} />
                            </td>
                            <td className="h-[70px] px-6 py-2 flex items-center gap-2">
                                <button onClick={() => handleViewJournal(student)} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-counselor-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-opacity">View Journal</button>
                                 <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-200 dark:bg-neutral-dark text-text-light dark:text-text-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-opacity">Chat</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {selectedStudent && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedStudent(null)}>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl max-w-2xl w-full h-3/4 flex flex-col" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">{selectedStudent.name}'s Journal (Read-only)</h3>
                    <div className="overflow-y-auto space-y-4 flex-1">
                        {studentJournals.length > 0 ? studentJournals.map(entry => (
                            <div key={entry.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{entry.title}</h4>
                                <p className="text-xs text-slate-400 mb-2">{new Date(entry.date).toDateString()}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{entry.content}</p>
                            </div>
                        )) : <p className="text-slate-400">No journal entries found.</p>}
                    </div>
                    <button onClick={() => setSelectedStudent(null)} className="mt-4 bg-primary text-white px-4 py-2 rounded-lg self-end">Close</button>
                </div>
            </div>
        )}
    </>;
};

export default CounselorDashboard;
