
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900 dark:border-b dark:border-gray-700">
      <div className="container px-4 py-3 mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Lumyn
          </div>
          <div className="flex items-center">
            {user && (
              <>
                <Link to="/profile" className="flex items-center transition-opacity duration-200 hover:opacity-80">
                  <span className="hidden mr-4 text-gray-700 sm:block dark:text-gray-300">Welcome, {user.name}</span>
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 mr-4 rounded-full" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
