
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';

const CompleteProfile: React.FC = () => {
    const { user, updateUserRole, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // If auth is not loading, and user is either not authenticated or already has a role, redirect them away.
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/');
            } else if (user?.role) {
                const homePath = user.role === Role.STUDENT ? '/student-dashboard' : '/counsellor-dashboard';
                navigate(homePath);
            }
        }
    }, [user, loading, isAuthenticated, navigate]);
    
    const handleRoleSelect = async (selectedRole: Role) => {
        setIsUpdating(true);
        setError('');
        const { error } = await updateUserRole(selectedRole);
        if (error) {
            setError('Could not update role. Please try again.');
            setIsUpdating(false);
        }
        // On success, the useEffect will redirect automatically when the user object is updated.
    };

    if (loading || !isAuthenticated || !user) {
        return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">Loading...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
            <div className="w-full max-w-md p-8 space-y-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-900 animate-fade-in-up">
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 mx-auto rounded-full shadow-lg" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user.name}!</h1>
                <p className="text-gray-600 dark:text-gray-300">To complete your registration, please select your role on the platform.</p>
                
                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center sm:space-x-4">
                    <button
                        onClick={() => handleRoleSelect(Role.STUDENT)}
                        disabled={isUpdating}
                        className="px-6 py-3 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        I am a Student
                    </button>
                    <button
                        onClick={() => handleRoleSelect(Role.COUNSELLOR)}
                        disabled={isUpdating}
                        className="px-6 py-3 font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        I am a Counsellor
                    </button>
                </div>
                {isUpdating && <p className="pt-2 text-sm text-gray-500">Updating...</p>}
                {error && <p className="pt-2 text-sm text-center text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default CompleteProfile;
