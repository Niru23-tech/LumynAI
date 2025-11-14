
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Role = 'student' | 'counselor';
type Flow = 'login' | 'signup';

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const queryParams = new URLSearchParams(location.search);
    const initialFlow = queryParams.get('flow') as Flow || 'login';

    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [flow, setFlow] = useState<Flow>(initialFlow);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedRole) {
            setError('Please select your role.');
            return;
        }
        const success = login(email, selectedRole);
        if (success) {
            const path = selectedRole === 'student' ? '/student/dashboard' : '/counselor/dashboard';
            navigate(path, { replace: true });
        } else {
            setError('Invalid credentials. Please use a mock email from the system. For example: alex@school.edu or evance@school.edu');
        }
    };
    
    const getWelcomeText = () => {
        if (!selectedRole) return "Welcome to MindEase";
        const roleText = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
        const flowText = flow.charAt(0).toUpperCase() + flow.slice(1);
        return `${roleText} ${flowText}`;
    }

    if (!selectedRole) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-900 rounded-xl shadow-soft">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white">Join MindEase</h2>
                    <p className="text-center text-slate-500 dark:text-slate-400">Please select your role to continue.</p>
                    <div className="flex gap-4">
                        <button onClick={() => setSelectedRole('student')} className="w-full flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-primary">school</span>
                            <span className="mt-2 font-semibold text-slate-800 dark:text-slate-100">I'm a Student</span>
                        </button>
                        <button onClick={() => setSelectedRole('counselor')} className="w-full flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-counselor-primary/10 dark:hover:bg-counselor-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-counselor-primary">health_and_safety</span>
                            <span className="mt-2 font-semibold text-slate-800 dark:text-slate-100">I'm a Counselor</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
             <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-xl shadow-soft">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{getWelcomeText()}</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        {flow === 'login' ? 'Access your dashboard' : 'Create a new account'}
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            autoComplete="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent focus:ring-primary focus:border-primary"
                            placeholder={selectedRole === 'student' ? 'e.g., alex@school.edu' : 'e.g., evance@school.edu'}
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            autoComplete="current-password" 
                            required 
                            className="w-full px-4 py-2 mt-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <button type="submit" className="w-full px-4 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-opacity-90">
                           {flow === 'login' ? 'Log In' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                    {flow === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setFlow(flow === 'login' ? 'signup' : 'login')} className="ml-1 font-semibold text-primary hover:underline">
                        {flow === 'login' ? 'Sign up' : 'Log in'}
                    </button>
                </p>
                <button onClick={() => setSelectedRole(null)} className="text-sm text-center w-full text-slate-500 dark:text-slate-400 hover:underline">
                    Back to role selection
                </button>
             </div>
        </div>
    );
};

export default AuthPage;
