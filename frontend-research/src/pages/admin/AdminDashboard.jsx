import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Eye,
  Download,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalPublications: 0,
    approved: 0,
    totalViews: 0,
    downloads: 0,
    latestSubmissions: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await api.get('/admin/dashboard');
        if (data) {
          setDashboardData(data);
        }
      } catch (err) {
        console.warn('Backend API call failed, using default empty dashboard state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && <AdminSidebar />}
 
       {/* Main Content View */}
       <div className={styles.mainContent}>
           <DashboardHeader
             onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
             notificationsRoute="/admin/notifications"
           />

        {/* Page Body */}
        <main className={styles.pageBody}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbItem}>Home</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbItem}>Admin</span>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbActive}>Dashboard</span>
          </div>

          {/* Page Title & Subtitle */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Repository administration</h1>
            <p className={styles.pageSubtext}>
              Curate the research library and monitor publication health.
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className={styles.statGrid}>
            {/* Card 1: Total Publications */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>TOTAL PUBLICATIONS</span>
                <span className={styles.statValue}>{loading ? '...' : dashboardData.totalPublications}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconYellow}`}>
                <FileText size={20} />
              </div>
            </div>

            {/* Card 2: Approved */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>APPROVED</span>
                <span className={styles.statValue}>{loading ? '...' : dashboardData.approved}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconGreen}`}>
                <CheckCircle2 size={20} />
              </div>
            </div>

            {/* Card 3: Total Views */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>TOTAL VIEWS</span>
                <span className={styles.statValue}>
                  {loading ? '...' : Number(dashboardData.totalViews).toLocaleString()}
                </span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconBlue}`}>
                <Eye size={20} />
              </div>
            </div>

            {/* Card 4: Downloads */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>DOWNLOADS</span>
                <span className={styles.statValue}>
                  {loading ? '...' : Number(dashboardData.downloads).toLocaleString()}
                </span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconOrange}`}>
                <Download size={20} />
              </div>
            </div>
          </div>

          {/* Latest Submissions Table */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Latest submissions</h2>
              <Link to="/admin/submissions" className={styles.viewAllLink}>
                Manage <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Submitted at</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading submissions...
                      </td>
                    </tr>
                  ) : dashboardData.latestSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    dashboardData.latestSubmissions.map((paper) => (
                      <tr key={paper.id}>
                        <td className={styles.paperTitleCell}>{paper.title}</td>
                        <td className={styles.studentNameCell}>{paper.studentName || 'Amara Perera'}</td>
                        <td>{paper.category || 'Computer Science'}</td>
                        <td>{formatDate(paper.submittedAt)}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              paper.status === 'APPROVED'
                                ? styles.statusApproved
                                : paper.status === 'PENDING'
                                ? styles.statusPending
                                : styles.statusRejected
                            }`}
                          >
                            {paper.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <span>&copy; 2026 ResearchSphere &mdash; Repository Administration Portal.</span>
          <span>v1.0 proto</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
