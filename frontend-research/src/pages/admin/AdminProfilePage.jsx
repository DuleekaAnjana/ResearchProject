import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, User, Mail, Shield, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './AdminProfilePage.module.css';

const AdminProfilePage = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && <AdminSidebar />}

      <div className={styles.mainContent}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/admin/notifications"
        />

        <main className={styles.pageBody}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbItem}>Home</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbItem}>Admin</span>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbActive}>Profile</span>
          </div>

          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Repository Admin Profile</h1>
            <p className={styles.pageSubtext}>
              View and manage your administrator account information.
            </p>
          </div>

          <div className={styles.profileContainer}>
            <div className={styles.card}>
              <div className={styles.profileHeader}>
                <div className={styles.avatarLarge}>RA</div>
                <div className={styles.profileMeta}>
                  <h2>Repositary Admin</h2>
                  <span className={styles.roleLabel}>System Administrator</span>
                </div>
              </div>

              <div className={styles.profileDetails}>
                <div className={styles.detailRow}>
                  <div className={styles.detailIcon}><User size={18} /></div>
                  <div className={styles.detailContent}>
                    <label>Full Name</label>
                    <span>Repositary Admin</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailIcon}><Mail size={18} /></div>
                  <div className={styles.detailContent}>
                    <label>Email Address</label>
                    <span>repoadmin@researchsphere.edu</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailIcon}><Shield size={18} /></div>
                  <div className={styles.detailContent}>
                    <label>Security Role</label>
                    <span>Repository Administrator (System Level)</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div className={styles.detailIcon}><Building size={18} /></div>
                  <div className={styles.detailContent}>
                    <label>Institution</label>
                    <span>ResearchSphere University Education</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <span>&copy; 2026 ResearchSphere &mdash; Repository Administration Portal.</span>
          <span>v1.0 proto</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminProfilePage;
