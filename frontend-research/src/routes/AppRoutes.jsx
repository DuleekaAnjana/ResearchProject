import { Routes, Route } from 'react-router-dom';
import Home from '../pages/shared/Home';
import NotFound from '../pages/shared/NotFound';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import StudentDashboard from '../pages/student/StudentDashboard';

/**
 * Application routes configuration
 */

const AppRoutes = () => {
  return (
    <Routes>
      {/* ====== Public Routes ====== */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/:role/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/forgot-password" element={<PlaceholderPage title="Forgot Password" />} />

      {/* Shared Pages */}
      <Route path="/about" element={<PlaceholderPage title="About" />} />
      <Route path="/contact" element={<PlaceholderPage title="Contact" />} />

      {/* ====== Student Routes ====== */}
      {/* TODO: Wrap with ProtectedRoute role="student" */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/upload" element={<PlaceholderPage title="Upload Research Paper" />} />
      <Route path="/student/edit/:id" element={<PlaceholderPage title="Edit Submission" />} />
      <Route path="/student/status" element={<PlaceholderPage title="Submission Status" />} />
      <Route path="/student/search" element={<PlaceholderPage title="Search Publications" />} />
      <Route path="/student/publication/:id" element={<PlaceholderPage title="Publication Details" />} />
      <Route path="/student/profile" element={<PlaceholderPage title="Student Profile" />} />

      {/* ====== Supervisor Routes ====== */}
      {/* TODO: Wrap with ProtectedRoute role="supervisor" */}
      <Route path="/supervisor/dashboard" element={<PlaceholderPage title="Supervisor Dashboard" />} />
      <Route path="/supervisor/assigned" element={<PlaceholderPage title="Assigned Papers" />} />
      <Route path="/supervisor/review/:id" element={<PlaceholderPage title="Review Paper" />} />
      <Route path="/supervisor/approval" element={<PlaceholderPage title="Approval Page" />} />
      <Route path="/supervisor/feedback/:id" element={<PlaceholderPage title="Feedback Page" />} />
      <Route path="/supervisor/profile" element={<PlaceholderPage title="Supervisor Profile" />} />

      {/* ====== Admin Routes ====== */}
      {/* TODO: Wrap with ProtectedRoute role="admin" */}
      <Route path="/admin/dashboard" element={<PlaceholderPage title="Admin Dashboard" />} />
      <Route path="/admin/users" element={<PlaceholderPage title="User Management" />} />
      <Route path="/admin/departments" element={<PlaceholderPage title="Department Management" />} />
      <Route path="/admin/categories" element={<PlaceholderPage title="Category Management" />} />
      <Route path="/admin/publications" element={<PlaceholderPage title="Publication Management" />} />
      <Route path="/admin/archive" element={<PlaceholderPage title="Archive Publications" />} />
      <Route path="/admin/reports" element={<PlaceholderPage title="Reports" />} />
      <Route path="/admin/statistics" element={<PlaceholderPage title="System Statistics" />} />

      {/* ====== 404 ====== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

/**
 * Temporary placeholder page for routes not yet built
 */
const PlaceholderPage = ({ title }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
    padding: '2rem',
  }}>
    <h1 style={{ fontSize: '2rem', color: '#1f2937' }}>{title}</h1>
    <p style={{ color: '#6b7280', fontSize: '1rem' }}>
      This page will be built in a future phase.
    </p>
  </div>
);

export default AppRoutes;
