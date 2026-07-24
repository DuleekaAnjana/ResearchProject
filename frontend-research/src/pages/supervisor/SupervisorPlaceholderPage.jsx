import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import SupervisorSidebar from '../../components/layout/SupervisorSidebar';
import styles from './SupervisorDashboard.module.css'; // Reuse dashboard layout styles

const SupervisorPlaceholderPage = ({ title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && <SupervisorSidebar />}

      <div className={styles.mainContent}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/supervisor/notifications"
        />

        <main className={styles.pageBody}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbItem}>Home</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbItem}>Supervisor</span>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbActive}>{title}</span>
          </div>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{title}</h1>
          </div>

          {/* Main Card with Remark */}
          <div className={styles.card} style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', borderColor: '#a7f3d0' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065f46', marginBottom: '0.5rem' }}>
                {title}
              </h2>
              <p style={{ color: '#047857', fontSize: '0.95rem' }}>
                This page will be built in a future phase.
              </p>
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <span>&copy; 2026 ResearchSphere &mdash; Supervisor Research Review Portal.</span>
          <span>v1.0 proto</span>
        </footer>
      </div>
    </div>
  );
};

export default SupervisorPlaceholderPage;
