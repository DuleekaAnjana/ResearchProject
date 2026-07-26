import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Sliders,
  Bell,
  User
} from 'lucide-react';
import styles from './SupervisorSidebar.module.css';

const SupervisorSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isDashboardActive = pathname === '/supervisor/dashboard';
  const isAssignedActive = pathname === '/supervisor/assigned';
  const isPendingActive = pathname === '/supervisor/pending';
  const isApprovedActive = pathname === '/supervisor/approved';
  const isRejectedActive = pathname === '/supervisor/rejected';
  const isAnalyticsActive = pathname === '/supervisor/analytics';
  const isNotificationsActive = pathname === '/supervisor/notifications';
  const isProfileActive = pathname === '/supervisor/profile';

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
            to="/supervisor/dashboard"
            className={`${styles.navItem} ${isDashboardActive ? styles.navItemActive : ''}`}
          >
            <LayoutDashboard className={styles.navIcon} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/supervisor/assigned"
            className={`${styles.navItem} ${isAssignedActive ? styles.navItemActive : ''}`}
          >
            <FileText className={styles.navIcon} />
            <span>Assigned Papers</span>
          </Link>

          <Link
            to="/supervisor/pending"
            className={`${styles.navItem} ${isPendingActive ? styles.navItemActive : ''}`}
          >
            <Clock className={styles.navIcon} />
            <span>Pending Reviews</span>
          </Link>

          <Link
            to="/supervisor/approved"
            className={`${styles.navItem} ${isApprovedActive ? styles.navItemActive : ''}`}
          >
            <CheckCircle2 className={styles.navIcon} />
            <span>Approved</span>
          </Link>

          <Link
            to="/supervisor/rejected"
            className={`${styles.navItem} ${isRejectedActive ? styles.navItemActive : ''}`}
          >
            <XCircle className={styles.navIcon} />
            <span>Rejected</span>
          </Link>



          <Link
            to="/supervisor/notifications"
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
            to="/supervisor/profile"
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

export default SupervisorSidebar;
