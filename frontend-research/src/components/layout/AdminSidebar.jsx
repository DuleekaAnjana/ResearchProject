import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Bell,
  User
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isDashboardActive = pathname === '/admin/dashboard';
  const isSubmissionsActive = pathname === '/admin/submissions';
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
