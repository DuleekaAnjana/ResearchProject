import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Bell,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  UserX
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isDashboardActive = pathname === '/admin/dashboard';
  const isSubmissionsActive = pathname === '/admin/submissions';
  const isPendingActive = pathname === '/admin/pending';
  const isVerifiedActive = pathname === '/admin/verified';
  const isDuplicateActive = pathname === '/admin/duplicate-detected';
  const isNoSupervisorsActive = pathname === '/admin/no-supervisors';
  const isNotificationsActive = pathname === '/admin/notifications';
  const isProfileActive = pathname === '/admin/profile';

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
            to="/admin/dashboard"
            className={`${styles.navItem} ${isDashboardActive ? styles.navItemActive : ''}`}
          >
            <LayoutDashboard className={styles.navIcon} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/submissions"
            className={`${styles.navItem} ${isSubmissionsActive ? styles.navItemActive : ''}`}
          >
            <FileText className={styles.navIcon} />
            <span>Manage Submissions</span>
          </Link>

          <Link
            to="/admin/pending"
            className={`${styles.navItem} ${isPendingActive ? styles.navItemActive : ''}`}
          >
            <Clock className={styles.navIcon} />
            <span>Pending</span>
          </Link>

          <Link
            to="/admin/verified"
            className={`${styles.navItem} ${isVerifiedActive ? styles.navItemActive : ''}`}
          >
            <CheckCircle className={styles.navIcon} />
            <span>Verified</span>
          </Link>

          <Link
            to="/admin/duplicate-detected"
            className={`${styles.navItem} ${isDuplicateActive ? styles.navItemActive : ''}`}
          >
            <AlertCircle className={styles.navIcon} />
            <span>Duplicate Detected</span>
          </Link>

          <Link
            to="/admin/no-supervisors"
            className={`${styles.navItem} ${isNoSupervisorsActive ? styles.navItemActive : ''}`}
          >
            <UserX className={styles.navIcon} />
            <span>No Supervisors Available</span>
          </Link>

          <Link
            to="/admin/notifications"
            className={`${styles.navItem} ${isNotificationsActive ? styles.navItemActive : ''}`}
          >
            <Bell className={styles.navIcon} />
            <span>Notifications</span>
          </Link>
        </div>

        {/* Account Section */}
        <div className={styles.navGroup}>
          <span className={styles.groupTitle}>Account</span>
          <Link
            to="/admin/profile"
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

export default AdminSidebar;
