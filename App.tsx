
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import StudentDashboard from './pages/StudentDashboard';
import CounselorDashboard from './pages/CounselorDashboard';
import AuthPage from './pages/AuthPage';

const App: React.FC = () => {
  return (
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute role="student">
                <ChatPage />
              </ProtectedRoute>
            } 
          />

          {/* Counselor Routes */}
          <Route 
            path="/counselor/dashboard" 
            element={
              <ProtectedRoute role="counselor">
                <CounselorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Redirect old routes */}
          <Route path="/dashboard/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/dashboard/counselor" element={<Navigate to="/counselor/dashboard" replace />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
  );
};

export default App;
