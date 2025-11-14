
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodDataPoint, JournalEntry, Appointment, AppointmentStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { mockJournalEntries, mockAppointments, mockCounselors } from '../data/mockData';

const weekData: MoodDataPoint[] = [
    { name: 'Mon', mood: 3 }, { name: 'Tue', mood: 5 }, { name: 'Wed', mood: 4 },
    { name: 'Thu', mood: 2 }, { name: 'Fri', mood: 6 }, { name: 'Sat', mood: 5 },
    { name: 'Sun', mood: 7 },
];

type StudentView = 'dashboard' | 'journal' | 'appointments';

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<StudentView>('dashboard');
    const [journalSearch, setJournalSearch] = useState('');
    
    // Simulate data fetching and updates
    const [appointments, setAppointments] = useState(() => mockAppointments.filter(appt => appt.studentId === user?.id));
    const [journalEntries, setJournalEntries] = useState(() => mockJournalEntries.filter(entry => entry.studentId === user?.id));

    const handleNewAppointment = (newAppt: Omit<Appointment, 'id' | 'studentId' | 'status'>) => {
        const appointment: Appointment = {
            id: `appt-${Date.now()}`,
            studentId: user!.id,
            status: AppointmentStatus.Pending,
            ...newAppt,
        };
        setAppointments(prev => [...prev, appointment]);
        // In a real app, you'd also update the mockAppointments in mockData.ts or send to a server
    };
    
    const filteredJournalEntries = useMemo(() => 
        journalEntries.filter(entry => {
            const searchTerm = journalSearch.toLowerCase();
            const entryDate = new Date(entry.date).toLocaleDateString().toLowerCase();
            return entry.title.toLowerCase().includes(searchTerm) ||
                   entry.content.toLowerCase().includes(searchTerm) ||
                   entryDate.includes(searchTerm);
        }),
        [journalEntries, journalSearch]
    );
        
    const handleLogout = () => {
      logout();
      navigate('/');
    };

    const renderView = () => {
        switch (currentView) {
            case 'journal':
                return <JournalView entries={filteredJournalEntries} searchTerm={journalSearch} setSearchTerm={setJournalSearch} />;
            case 'appointments':
                return <AppointmentsView appointments={appointments} onNewAppointment={handleNewAppointment} />;
            case 'dashboard':
            default:
                return <DashboardView appointments={appointments} />;
        }
    };
    
    return (
        <div className="bg-background-light dark:bg-background-dark font-display">
            <div className="relative flex h-auto min-h-screen w-full flex-col">
                <div className="layout-container flex h-full grow flex-col">
                    <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-5">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1 gap-6">
                           <header className="flex items-center justify-between whitespace-nowrap bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-solid border-slate-200/50 dark:border-slate-800/50 px-6 py-3 rounded-xl sticky top-4 z-10">
                                <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-white">
                                    <div className="size-6 text-primary">
                                        <span className="material-symbols-outlined !text-3xl">psychology</span>
                                    </div>
                                    <h2 className="text-lg font-bold tracking-[-0.015em]">MindEase</h2>
                                </Link>
                                <div className="hidden sm:flex flex-1 justify-center gap-8">
                                    <div className="flex items-center gap-8">
                                        <a onClick={() => setCurrentView('dashboard')} className={`cursor-pointer text-sm font-medium leading-normal ${currentView === 'dashboard' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'}`}>Dashboard</a>
                                        <a onClick={() => setCurrentView('journal')} className={`cursor-pointer text-sm font-medium leading-normal ${currentView === 'journal' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'}`}>Journal</a>
                                        <a onClick={() => setCurrentView('appointments')} className={`cursor-pointer text-sm font-medium leading-normal ${currentView === 'appointments' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'}`}>Appointments</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAELkrmFHYRUv8mrM29bJ8k8_8n1tYnG6pJ7Dq-uS7xJ3raW5LF1cR2X9eCKBlEhL0aQuR2H5DZVuJ19laopBDcFIL1z0lAUCbkuTiI5ZUOfpcev-OcT8nuT_UDd8S2hPRWmFXgruzi6VeuG4oD1gSL-4d-Qqfqw-UaOOY0RYiLDKdhZ8pyS9vYapeRnXHUIrXYmb5izq-vWr-MvEMEKmLZ9DWnnEif5zQqWKbfkve9M4eFGtooceJiCyDlD42gl695IGnLalK6vhk")` }}></div>
                                    <button onClick={handleLogout} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">logout</span>
                                    </button>
                                </div>
                            </header>

                            <main className="flex flex-col gap-8 mt-4">
                                <div className="flex flex-wrap justify-between gap-4 p-4 items-center">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Good morning, {user?.name?.split(' ')[0]}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Remember to be kind to yourself today. We're here to support you.</p>
                                    </div>
                                </div>
                                {renderView()}
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const DashboardView: React.FC<{appointments: Appointment[]}> = ({appointments}) => {
    const navigate = useNavigate();
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

    const pendingAppointments = appointments.filter(a => a.status === AppointmentStatus.Pending).length;

    return <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
                 <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Your Mood Journey</h2>
                    </div>
                     <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={weekData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#306ee8" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#306ee8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fill: 'rgb(100 116 139)', fontSize: 13 }} axisLine={false} tickLine={false} />
                            <YAxis hide={true} domain={[0, 10]} />
                             <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: 'none', borderRadius: '0.5rem' }} />
                            <Area type="monotone" dataKey="mood" stroke="#306ee8" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                     <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">Resources For You</h2>
                     <div className="flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                            <div className="aspect-video w-40 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqT83rts7Yk7FlMTSRyMEcyrsKr1rvTxF4erwZ7QM1j1ai4P1iNSvHleqOWYaOySgC2cw9bS36Lh1aND6h9ioO5MvpNYCi13f_KerWqd0ROGTkYBqBD0gk-L2H0Ev9Cn5fhWTp6eWed7SJDPxMsSbOCQ3IsHqO55tsJQzhKLRbgH63N2DdxbqqxrDcBNj0pK7JpAiCA1-r4KlTz5cFECSqOcSeORF4JIsKflHTZjX7s1A2IOS5PXl4An58hVRVIkA7Lov46lU4L0c')` }}></div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">5-Minute Breathing Exercise</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">A quick way to find your center and reduce stress before your next class.</p>
                                <button onClick={() => setIsResourceModalOpen(true)} className="text-sm font-semibold text-primary dark:text-blue-400 hover:underline mt-2">Read More</button>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
            <div className="lg:col-span-1 flex flex-col gap-8">
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-4">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">How can we help you today?</h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/chat')} className="flex text-left items-center gap-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center justify-center size-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary dark:text-blue-300">
                                <span className="material-symbols-outlined">chat_bubble</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-100">Chat with AI Companion</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Get instant, confidential support</p>
                            </div>
                        </button>
                         <div className="text-left items-center gap-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800/80">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center size-10 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300">
                                    <span className="material-symbols-outlined">event_available</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">Appointments</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{pendingAppointments > 0 ? `${pendingAppointments} pending request(s)` : 'No pending requests'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {isResourceModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsResourceModalOpen(false)}>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">5-Minute Breathing Exercise</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">Find a quiet space where you won't be disturbed. Sit comfortably in a chair with your feet flat on the floor, or lie down on your back.</p>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">1. Close your eyes gently. Bring your attention to your breath.</p>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">2. Inhale slowly through your nose for a count of four. Feel your belly expand.</p>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">3. Hold your breath for a count of four.</p>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">4. Exhale slowly through your mouth for a count of six. Feel your belly contract. Repeat for 5 minutes.</p>
                    <button onClick={() => setIsResourceModalOpen(false)} className="bg-primary text-white px-4 py-2 rounded-lg">Close</button>
                </div>
            </div>
        )}
    </>;
};

const JournalView: React.FC<{entries: JournalEntry[], searchTerm: string, setSearchTerm: (term: string) => void}> = ({entries, searchTerm, setSearchTerm}) => {
    return <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">My Journal</h2>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input type="text" placeholder="Search by title, content, or date..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-80 pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-primary"/>
            </div>
        </div>
        <div className="flex flex-col gap-4">
            {entries.length > 0 ? entries.map(entry => (
                <div key={entry.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{entry.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{new Date(entry.date).toLocaleDateString()}</p>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{entry.content}</p>
                </div>
            )) : <p className="text-slate-500 dark:text-slate-400 text-center py-8">No journal entries found for your search.</p>}
        </div>
    </div>;
};

const AppointmentsView: React.FC<{appointments: Appointment[], onNewAppointment: (newAppt: Omit<Appointment, 'id' | 'studentId' | 'status'>) => void}> = ({appointments, onNewAppointment}) => {
    const [isBookingModalOpen, setBookingModalOpen] = useState(false);
    
    const getStatusChip = (status: AppointmentStatus) => {
        const styles: Record<AppointmentStatus, string> = {
            [AppointmentStatus.Pending]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
            [AppointmentStatus.Confirmed]: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
            [AppointmentStatus.Rejected]: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
            [AppointmentStatus.Completed]: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
    }
    
    return <>
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">My Appointments</h2>
                <button onClick={() => setBookingModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-semibold text-primary dark:text-blue-300 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                    <span className="material-symbols-outlined !text-base">add</span>
                    Book Appointment
                </button>
            </div>
            <div className="space-y-4">
                {appointments.length > 0 ? appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(appt => {
                    const counselor = mockCounselors.find(c => c.id === appt.counselorId);
                    return <div key={appt.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">With {counselor?.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(appt.date).toDateString()} at {appt.time}</p>
                        </div>
                        {getStatusChip(appt.status)}
                    </div>
                }) : <p className="text-slate-500 dark:text-slate-400 text-center py-8">You have no appointments.</p>}
            </div>
        </div>
        {isBookingModalOpen && (
            <BookingModal 
                onClose={() => setBookingModalOpen(false)} 
                onSubmit={onNewAppointment}
            />
        )}
    </>;
};

const BookingModal: React.FC<{onClose: () => void, onSubmit: (data: any) => void}> = ({onClose, onSubmit}) => {
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            counselorId: formData.get('counselorId'),
            date: formData.get('date'),
            time: '10:00 AM', // Hardcoded for simplicity
            notes: formData.get('notes'),
        };
        onSubmit(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Book an Appointment</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Counselor</label>
                        <select name="counselorId" className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary focus:ring-primary">
                            {mockCounselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                         <input name="date" type="date" required className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary focus:ring-primary"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                        <textarea name="notes" placeholder="What would you like to talk about?" className="w-full h-24 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary focus:ring-primary"></textarea>
                    </div>
                     <div className="flex justify-end gap-2">
                         <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 px-4 py-2 rounded-lg">Cancel</button>
                         <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">Request Appointment</button>
                     </div>
                </form>
            </div>
        </div>
    );
};


export default StudentDashboard;
