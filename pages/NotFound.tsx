
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
      <p className="text-2xl font-medium text-gray-800 dark:text-gray-200 mt-4">Page Not Found</p>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
