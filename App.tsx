
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Role } from './types';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import SchoolDirectorDashboard from './pages/SchoolDirectorDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import UserManagement from './pages/UserManagement';
import ReportsDashboard from './pages/ReportsDashboard';
import ClassManagement from './pages/ClassManagement';
import StudentManagement from './pages/StudentManagement';
import PaymentManagement from './pages/PaymentManagement';
import NotificationCenter from './pages/NotificationCenter';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};

const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  switch (user.role) {
    case Role.SCHOOL_DIRECTOR:
      return <Navigate to="/school-dashboard" replace />;
    case Role.TEACHER:
      return <Navigate to="/teacher-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <RoleBasedRedirect /> : <Login />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute allowedRoles={Object.values(Role)}><RoleBasedRedirect /></ProtectedRoute>} />

        {/* School Director Routes */}
        <Route path="/school-dashboard" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><SchoolDirectorDashboard /></ProtectedRoute>} />
        <Route path="/class-management" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><ClassManagement /></ProtectedRoute>} />
        <Route path="/student-management" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><StudentManagement /></ProtectedRoute>} />
        <Route path="/payment-management" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><PaymentManagement /></ProtectedRoute>} />
        <Route path="/user-management" element={<ProtectedRoute allowedRoles={[Role.SCHOOL_DIRECTOR]}><UserManagement /></ProtectedRoute>} />
        
        {/* Teacher Routes */}
        <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={[Role.TEACHER]}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/notification-center" element={<ProtectedRoute allowedRoles={[Role.TEACHER]}><NotificationCenter /></ProtectedRoute>} />

        {/* Common Routes */}
        <Route path="/reports-dashboard" element={<ProtectedRoute allowedRoles={Object.values(Role)}><ReportsDashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={Object.values(Role)}><Settings /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
