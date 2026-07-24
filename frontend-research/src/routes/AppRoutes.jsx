import { Routes, Route } from 'react-router-dom';
import Home from '../pages/shared/Home';
import NotFound from '../pages/shared/NotFound';
import TermsPage from '../pages/shared/TermsPage';
import PrivacyPage from '../pages/shared/PrivacyPage';
import ContactPage from '../pages/shared/ContactPage';
import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import ChooseRegistration from '../pages/auth/ChooseRegistration';
import NewStudentRegister from '../pages/auth/NewStudentRegister';
import NewSupervisorRegister from '../pages/auth/NewSupervisorRegister';
import StudentDashboard from '../pages/student/StudentDashboard';
import SupervisorDashboard from '../pages/supervisor/SupervisorDashboard';
import SupervisorPlaceholderPage from '../pages/supervisor/SupervisorPlaceholderPage';
import NotificationsPage from '../pages/student/NotificationsPage';
import SearchPublicationsPage from '../pages/student/SearchPublicationsPage';
import AllPublicationsPage from '../pages/student/AllPublicationsPage';
import NewSubmissionPage from '../pages/student/NewSubmissionPage';
import SubmissionStatusPage from '../pages/student/SubmissionStatusPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import ArticlesPage from '../pages/student/ArticlesPage';
import BlogsPage from '../pages/student/BlogsPage';
import ContactSupervisorsPage from '../pages/student/ContactSupervisorsPage';

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
      <Route path="/register" element={<ChooseRegistration />} />
      <Route path="/auth/register" element={<ChooseRegistration />} />
      <Route path="/chooseregistration" element={<ChooseRegistration />} />
      <Route path="/newstudentregistegpage" element={<NewStudentRegister />} />
      <Route path="/newsupervisorregistergpage" element={<NewSupervisorRegister />} />
      <Route path="/forgot-password" element={<PlaceholderPage title="Forgot Password" />} />

      {/* Shared / Legal Pages */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/about" element={<PlaceholderPage title="About" />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* ====== Student Routes ====== */}
      {/* TODO: Wrap with ProtectedRoute role="student" */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/upload" element={<NewSubmissionPage />} />
      <Route path="/student/edit/:id" element={<PlaceholderPage title="Edit Submission" />} />
      <Route path="/student/status" element={<SubmissionStatusPage />} />
      <Route path="/student/search" element={<SearchPublicationsPage />} />
      <Route path="/student/publications" element={<AllPublicationsPage />} />
      <Route path="/student/notifications" element={<NotificationsPage />} />
      <Route path="/student/publication/:id" element={<PlaceholderPage title="Publication Details" />} />
      <Route path="/student/profile" element={<StudentProfilePage />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/student/contact" element={<ContactSupervisorsPage />} />

      {/* ====== Supervisor Routes ====== */}
      <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
      <Route path="/supervisor/assigned" element={<SupervisorPlaceholderPage title="Assigned Papers" />} />
      <Route path="/supervisor/pending" element={<SupervisorPlaceholderPage title="Pending Reviews" />} />
      <Route path="/supervisor/approved" element={<SupervisorPlaceholderPage title="Approved Papers" />} />
      <Route path="/supervisor/rejected" element={<SupervisorPlaceholderPage title="Rejected Papers" />} />
      <Route path="/supervisor/analytics" element={<SupervisorPlaceholderPage title="Analytics" />} />
      <Route path="/supervisor/notifications" element={<SupervisorPlaceholderPage title="Notifications" />} />
      <Route path="/supervisor/profile" element={<SupervisorPlaceholderPage title="Supervisor Profile" />} />
      <Route path="/supervisor/review/:id" element={<PlaceholderPage title="Review Paper" />} />
      <Route path="/supervisor/approval" element={<PlaceholderPage title="Approval Page" />} />
      <Route path="/supervisor/feedback/:id" element={<PlaceholderPage title="Feedback Page" />} />

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
