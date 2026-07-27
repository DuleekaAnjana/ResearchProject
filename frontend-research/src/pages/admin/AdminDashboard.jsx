import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  Files,
  UserX,
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
    totalSubmissions: 0,
    underAdminApproval: 0,
    verified: 0,
    duplicateDetected: 0,
    supervisorUnavailable: 0,
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

  const getStatusBadge = (paper) => {
    const status = paper.adminApprovalStatus || paper.status;
    if (status === 'APPROVED' || status === 'VERIFIED') {
      return <span className={`${styles.statusBadge} ${styles.statusVerified}`}>VERIFIED</span>;
    }
    if (status === 'DUPLICATE DETECTED' || status === 'DUPLICATE_DETECTED') {
      return <span className={`${styles.statusBadge} ${styles.statusDuplicate}`}>DUPLICATE DETECTED</span>;
    }
    if (status === 'SUPERVISOR NOT AVAILABLE' || status === 'SUPERVISOR_NOT_AVAILABLE' || status === 'SUPERVISOR UNAVAILABLE' || status === 'SUPERVISOR_UNAVAILABLE') {
      return <span className={`${styles.statusBadge} ${styles.statusNoSupervisor}`}>SUPERVISOR UNAVAILABLE</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.statusUnderApproval}`}>UNDER ADMIN APPROVAL</span>;
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
            <h1 className={styles.pageTitle}>Repository Administration</h1>
            <p className={styles.pageSubtext}>
              Curate the research library and monitor publication health.
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className={styles.statGrid}>
            {/* Card 1: Total Submissions */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>TOTAL SUBMISSIONS</span>
                <span className={styles.statValue}>{loading ? '...' : (dashboardData.totalSubmissions || 0)}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconYellow}`}>
                <FileText size={20} />
              </div>
            </div>

            {/* Card 2: Under Admin Approval */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>UNDER ADMIN APPROVAL</span>
                <span className={styles.statValue}>{loading ? '...' : (dashboardData.underAdminApproval || 0)}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconBlue}`}>
                <Clock size={20} />
              </div>
            </div>

            {/* Card 3: Verified */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>VERIFIED</span>
                <span className={styles.statValue}>
                  {loading ? '...' : Number(dashboardData.verified || 0).toLocaleString()}
                </span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconGreen}`}>
                <CheckCircle2 size={20} />
              </div>
            </div>

            {/* Card 4: Duplicate Detected */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>DUPLICATE DETECTED</span>
                <span className={styles.statValue}>
                  {loading ? '...' : Number(dashboardData.duplicateDetected || 0).toLocaleString()}
                </span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconOrange}`}>
                <Files size={20} />
              </div>
            </div>

            {/* Card 5: Not Available Supervisor */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>NO SUPERVISORS AVAILABLE</span>
                <span className={styles.statValue}>
                  {loading ? '...' : Number(dashboardData.supervisorUnavailable || 0).toLocaleString()}
                </span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconOrange}`} style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                <UserX size={20} />
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
                    <th>Publication ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Submitted at</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading submissions...
                      </td>
                    </tr>
                  ) : dashboardData.latestSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    dashboardData.latestSubmissions.map((paper) => (
                      <tr key={paper.id}>
                        <td style={{ fontWeight: 600, color: '#475569' }}>
                          {paper.formattedPublicationId || `PUB-${paper.id}`}
                        </td>
                        <td className={styles.paperTitleCell}>{paper.title}</td>
                        <td className={styles.studentNameCell}>{paper.studentName || 'Amara Perera'}</td>
                        <td>{paper.category || 'Computer Science'}</td>
                        <td>{formatDate(paper.submittedAt)}</td>
                        <td>{getStatusBadge(paper)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className={styles.reviewBtn}
                            onClick={() => navigate(`/admin/review/${paper.id}`)}
                          >
                            Review
                          </button>
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
