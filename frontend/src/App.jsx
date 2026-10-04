import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaintPage } from './pages/student/SubmitComplaintPage';
import { ComplaintDetailPage } from './pages/student/ComplaintDetailPage';
import { ReviewerDashboard } from './pages/reviewer/ReviewerDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminHeatmapPage } from './pages/admin/AdminHeatmapPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminManagementPage } from './pages/admin/AdminManagementPage';
import { IncidentsListPage } from './pages/incidents/IncidentsListPage';
import { IncidentDetailPage } from './pages/incidents/IncidentDetailPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's home portal
    if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
    if (user.role === 'REVIEWER') return <Navigate to="/reviewer" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  }

  return children;
}

function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        {user && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            user.role === 'STUDENT' ? (
              <Navigate to="/student" />
            ) : user.role === 'REVIEWER' ? (
              <Navigate to="/reviewer" />
            ) : user.role === 'STAFF' ? (
              <Navigate to="/staff" />
            ) : (
              <Navigate to="/admin" />
            )
          ) : (
            <Layout>
              <LoginPage />
            </Layout>
          )
        }
      />
      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Layout>
              <SignupPage />
            </Layout>
          )
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <Layout>
              <StudentDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/submit"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <Layout>
              <SubmitComplaintPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/complaints/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ComplaintDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Reviewer Routes */}
      <Route
        path="/reviewer"
        element={
          <ProtectedRoute allowedRoles={['REVIEWER', 'ADMIN']}>
            <Layout>
              <ReviewerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
            <Layout>
              <StaffDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/heatmap"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'REVIEWER']}>
            <Layout>
              <AdminHeatmapPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminAuditLogsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Global Incident Routes */}
      <Route
        path="/incidents"
        element={
          <ProtectedRoute>
            <Layout>
              <IncidentsListPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <IncidentDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="*"
        element={
          user ? (
            user.role === 'STUDENT' ? (
              <Navigate to="/student" replace />
            ) : user.role === 'REVIEWER' ? (
              <Navigate to="/reviewer" replace />
            ) : user.role === 'STAFF' ? (
              <Navigate to="/staff" replace />
            ) : (
              <Navigate to="/admin" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
