
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/shared/Layout';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Loading user profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center h-full p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
          <div className="flex flex-col items-center">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-32 h-32 rounded-full shadow-lg"
            />
            <div className="mt-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
            <span className="mt-4 px-3 py-1 text-sm font-semibold text-indigo-800 bg-indigo-100 rounded-full dark:bg-indigo-900 dark:text-indigo-200 capitalize">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
