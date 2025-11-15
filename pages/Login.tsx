import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
        if (user.role === Role.STUDENT) {
            navigate('/student-dashboard');
        } else if (user.role === Role.COUNSELLOR) {
            navigate('/counsellor-dashboard');
        }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) throw error;
      } else {
        const { error } = await signup(name, email, password, role);
        if (error) throw error;

        // On successful signup, show message and switch to login form
        setSuccessMessage('Sign up successful! Please check your email to confirm your account.');
        setIsLogin(true);
        // Clear form fields for a clean transition
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">Lumyn</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {isLogin ? 'Welcome back! Please sign in.' : 'Create your account to get started.'}
          </p>
        </div>

        {successMessage && <p className="text-sm text-center text-green-500 animate-fade-in-up">{successMessage}</p>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Full Name"
              />
            </div>
          )}
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Email address"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Password (min. 6 characters)"
            />
          </div>

          {!isLogin && (
            <div className="flex items-center justify-around">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">I am a:</span>
                <div className="flex items-center">
                    <input id="role-student" name="role" type="radio" checked={role === Role.STUDENT} onChange={() => setRole(Role.STUDENT)} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                    <label htmlFor="role-student" className="block ml-2 text-sm text-gray-900 dark:text-gray-300">Student</label>
                </div>
                <div className="flex items-center">
                    <input id="role-counsellor" name="role" type="radio" checked={role === Role.COUNSELLOR} onChange={() => setRole(Role.COUNSELLOR)} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                    <label htmlFor="role-counsellor" className="block ml-2 text-sm text-gray-900 dark:text-gray-300">Counsellor</label>
                </div>
            </div>
          )}

          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            {isLogin ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;