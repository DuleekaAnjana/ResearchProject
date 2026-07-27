import { Routes, Route } from 'react-router-dom';
import Home from '../pages/shared/Home';
import NotFound from '../pages/shared/NotFound';
import ProtectedRoute from './ProtectedRoute';
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
import AssignedPapers from '../pages/supervisor/AssignedPapers';
import ReviewPaperDummy from '../pages/supervisor/ReviewPaperDummy';
import SupervisorPlaceholderPage from '../pages/supervisor/SupervisorPlaceholderPage';
import SupervisorNotificationsPage from '../pages/supervisor/SupervisorNotificationsPage';
import SupervisorProfilePage from '../pages/supervisor/SupervisorProfilePage';
import NotificationsPage from '../pages/student/NotificationsPage';
import SearchPublicationsPage from '../pages/student/SearchPublicationsPage';
import AllPublicationsPage from '../pages/student/AllPublicationsPage';
import NewSubmissionPage from '../pages/student/NewSubmissionPage';
import SubmissionStatusPage from '../pages/student/SubmissionStatusPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import ArticlesPage from '../pages/student/ArticlesPage';
import BlogsPage from '../pages/student/BlogsPage';
import ContactSupervisorsPage from '../pages/student/ContactSupervisorsPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageSubmissions from '../pages/admin/ManageSubmissions';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import AdminReviewPage from '../pages/admin/AdminReviewPage';
import PendingSubmissions from '../pages/admin/PendingSubmissions';
import VerifiedSubmissions from '../pages/admin/VerifiedSubmissions';
import DuplicateDetectedSubmissions from '../pages/admin/DuplicateDetectedSubmissions';
import NoSupervisorsSubmissions from '../pages/admin/NoSupervisorsSubmissions';

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
      <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/upload" element={<ProtectedRoute allowedRole="student"><NewSubmissionPage /></ProtectedRoute>} />
      <Route path="/student/edit/:id" element={<ProtectedRoute allowedRole="student"><PlaceholderPage title="Edit Submission" /></ProtectedRoute>} />
      <Route path="/student/status" element={<ProtectedRoute allowedRole="student"><SubmissionStatusPage /></ProtectedRoute>} />
      <Route path="/student/search" element={<ProtectedRoute allowedRole="student"><SearchPublicationsPage /></ProtectedRoute>} />
      <Route path="/student/publications" element={<ProtectedRoute allowedRole="student"><AllPublicationsPage /></ProtectedRoute>} />
      <Route path="/student/notifications" element={<ProtectedRoute allowedRole="student"><NotificationsPage /></ProtectedRoute>} />
      <Route path="/student/publication/:id" element={<ProtectedRoute allowedRole="student"><PlaceholderPage title="Publication Details" /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/articles" element={<ProtectedRoute allowedRole="student"><ArticlesPage /></ProtectedRoute>} />
      <Route path="/blogs" element={<ProtectedRoute allowedRole="student"><BlogsPage /></ProtectedRoute>} />
      <Route path="/student/contact" element={<ProtectedRoute allowedRole="student"><ContactSupervisorsPage /></ProtectedRoute>} />

      {/* ====== Supervisor Routes ====== */}
      <Route path="/supervisor/dashboard" element={<ProtectedRoute allowedRole="supervisor"><SupervisorDashboard /></ProtectedRoute>} />
      <Route path="/supervisor/assigned" element={<ProtectedRoute allowedRole="supervisor"><AssignedPapers /></ProtectedRoute>} />
      <Route path="/supervisor/pending" element={<ProtectedRoute allowedRole="supervisor"><AssignedPapers filterStatus="PENDING" /></ProtectedRoute>} />
      <Route path="/supervisor/approved" element={<ProtectedRoute allowedRole="supervisor"><AssignedPapers filterStatus="APPROVED" /></ProtectedRoute>} />
      <Route path="/supervisor/rejected" element={<ProtectedRoute allowedRole="supervisor"><AssignedPapers filterStatus="REJECTED" /></ProtectedRoute>} />
      <Route path="/supervisor/notifications" element={<ProtectedRoute allowedRole="supervisor"><SupervisorNotificationsPage /></ProtectedRoute>} />
      <Route path="/supervisor/profile" element={<ProtectedRoute allowedRole="supervisor"><SupervisorProfilePage /></ProtectedRoute>} />
      <Route path="/supervisor/review/:id" element={<ProtectedRoute allowedRole="supervisor"><ReviewPaperDummy /></ProtectedRoute>} />
      <Route path="/supervisor/approval" element={<ProtectedRoute allowedRole="supervisor"><PlaceholderPage title="Approval Page" /></ProtectedRoute>} />
      <Route path="/supervisor/feedback/:id" element={<ProtectedRoute allowedRole="supervisor"><PlaceholderPage title="Feedback Page" /></ProtectedRoute>} />

      {/* ====== Admin Routes ====== */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="repositary admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/submissions" element={<ProtectedRoute allowedRole="repositary admin"><ManageSubmissions /></ProtectedRoute>} />
      <Route path="/admin/pending" element={<ProtectedRoute allowedRole="repositary admin"><PendingSubmissions /></ProtectedRoute>} />
      <Route path="/admin/verified" element={<ProtectedRoute allowedRole="repositary admin"><VerifiedSubmissions /></ProtectedRoute>} />
      <Route path="/admin/duplicate-detected" element={<ProtectedRoute allowedRole="repositary admin"><DuplicateDetectedSubmissions /></ProtectedRoute>} />
      <Route path="/admin/no-supervisors" element={<ProtectedRoute allowedRole="repositary admin"><NoSupervisorsSubmissions /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute allowedRole="repositary admin"><AdminNotificationsPage /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRole="repositary admin"><AdminProfilePage /></ProtectedRoute>} />
      <Route path="/admin/review/:id" element={<ProtectedRoute allowedRole="repositary admin"><AdminReviewPage /></ProtectedRoute>} />

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
