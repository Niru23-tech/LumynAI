
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import CounsellorDashboard from './pages/CounsellorDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { Role } from './types';
import Profile from './pages/Profile';
import CompleteProfile from './pages/CompleteProfile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route 
        path="/student-dashboard" 
        element={
          <ProtectedRoute allowedRoles={[Role.STUDENT]}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/counsellor-dashboard" 
        element={
          <ProtectedRoute allowedRoles={[Role.COUNSELLOR]}>
            <CounsellorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={[Role.STUDENT, Role.COUNSELLOR]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;