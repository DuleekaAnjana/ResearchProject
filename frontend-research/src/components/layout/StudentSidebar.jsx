import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  BarChart3,
  Bell,
  Folder,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  Compass,
  BookOpen,
  User
} from 'lucide-react';
import styles from './StudentSidebar.module.css';

const StudentSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Parse query params to highlight specific tabs (like drafts, pending, etc.)
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');

  const isDashboardActive = pathname === '/student/dashboard' && (!tab || tab === 'dashboard');
  const isAnalyticsActive = pathname === '/student/dashboard' && tab === 'analytics';
  const isNotificationsActive = pathname === '/student/notifications';
  const isAllPublicationsActive = pathname === '/student/publications';
  const isNewSubmissionActive = pathname === '/student/upload';
  const isDraftsActive = pathname === '/student/status' && tab === 'drafts';
  const isPendingActive = pathname === '/student/status' && tab === 'pending';
  const isApprovedActive = pathname === '/student/status' && tab === 'approved';
  const isRejectedActive = pathname === '/student/status' && tab === 'rejected';
  const isHistoryActive = pathname === '/student/status' && !tab;
  const isLibraryActive = pathname === '/student/search';
  const isArticlesActive = pathname === '/articles';
  const isBlogsActive = pathname === '/blogs';
  const isContactActive = pathname === '/student/contact';
  const isProfileActive = pathname === '/student/profile';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoIcon}>
          <GraduationCap size={20} />
        </div>
        <div className={styles.logoTextGroup}>
          <span className={styles.logoTitle}>ResearchSphere</span>
          <span className={styles.logoSubtitle}>RESEARCH REPOSITORY</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {/* Workspace Section */}
        <div className={styles.navGroup}>
          <span className={styles.groupTitle}>Workspace</span>
          <Link
            to="/student/dashboard"
            className={`${styles.navItem} ${isDashboardActive ? styles.navItemActive : ''}`}
          >
            <LayoutDashboard className={styles.navIcon} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/student/notifications"
            className={`${styles.navItem} ${isNotificationsActive ? styles.navItemActive : ''}`}
          >
            <Bell className={styles.navIcon} />
            <span>Notifications</span>
          </Link>
        </div>

        {/* Submissions Section */}
        <div className={styles.navGroup}>
          <span className={styles.groupTitle}>Submissions</span>
          <Link
            to="/student/publications"
            className={`${styles.navItem} ${isAllPublicationsActive ? styles.navItemActive : ''}`}
          >
            <Folder className={styles.navIcon} />
            <span>All Submissions</span>
          </Link>
          <Link
            to="/student/upload"
            className={`${styles.navItem} ${isNewSubmissionActive ? styles.navItemActive : ''}`}
          >
            <Plus className={styles.navIcon} />
            <span>New Submission</span>
          </Link>

          <Link
            to="/student/status?tab=pending"
            className={`${styles.navItem} ${isPendingActive ? styles.navItemActive : ''}`}
          >
            <Clock className={styles.navIcon} />
            <span>Pending</span>
          </Link>
          <Link
            to="/student/status?tab=approved"
            className={`${styles.navItem} ${isApprovedActive ? styles.navItemActive : ''}`}
          >
            <CheckCircle2 className={styles.navIcon} />
            <span>Approved</span>
          </Link>
          <Link
            to="/student/status?tab=rejected"
            className={`${styles.navItem} ${isRejectedActive ? styles.navItemActive : ''}`}
          >
            <XCircle className={styles.navIcon} />
            <span>Rejected</span>
          </Link>
          <Link
            to="/student/status"
            className={`${styles.navItem} ${isHistoryActive ? styles.navItemActive : ''}`}
          >
            <Bookmark className={styles.navIcon} />
            <span>Submission History</span>
          </Link>
        </div>

        {/* Discover Section */}
        <div className={styles.navGroup}>
          <span className={styles.groupTitle}>Discover</span>
          <Link
            to="/student/search"
            className={`${styles.navItem} ${isLibraryActive ? styles.navItemActive : ''}`}
          >
            <Compass className={styles.navIcon} />
            <span>Research Library</span>
          </Link>
          <Link
            to="/articles"
            className={`${styles.navItem} ${isArticlesActive ? styles.navItemActive : ''}`}
          >
            <BookOpen className={styles.navIcon} />
            <span>Articles</span>
          </Link>
          <Link
            to="/blogs"
            className={`${styles.navItem} ${isBlogsActive ? styles.navItemActive : ''}`}
          >
            <FileText className={styles.navIcon} />
            <span>Blogs</span>
          </Link>
          <Link
            to="/student/contact"
            className={`${styles.navItem} ${isContactActive ? styles.navItemActive : ''}`}
          >
            <User className={styles.navIcon} />
            <span>Contact Supervisors</span>
          </Link>
        </div>

        {/* Account Section */}
        <div className={styles.navGroup}>
          <span className={styles.groupTitle}>Account</span>
          <Link
            to="/student/profile"
            className={`${styles.navItem} ${isProfileActive ? styles.navItemActive : ''}`}
          >
            <User className={styles.navIcon} />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default StudentSidebar;
