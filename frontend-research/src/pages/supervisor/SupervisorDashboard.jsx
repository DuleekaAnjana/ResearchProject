import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Bell,
  PanelLeft,
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Sliders,
  User,
  ArrowRight,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import SupervisorSidebar from '../../components/layout/SupervisorSidebar';
import styles from './SupervisorDashboard.module.css';

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    supervisorName: user?.name || 'Amara Perera',
    supervisorEmail: user?.email || 'demo@researchsphere.edu',
    assignedPapers: 8,
    pendingReviews: 1,
    approved: 6,
    rejected: 1,
    avgReviewTime: '2.4 days',
    recentReviews: [],
    weeklyWorkload: { Mon: 3, Tue: 5, Wed: 2, Thu: 6, Fri: 4, Sat: 1, Sun: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const emailParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
        const data = await api.get(`/supervisor/dashboard${emailParam}`);
        if (data) {
          setDashboardData(data);
        }
      } catch (err) {
        console.warn('Backend API call failed, using default seeded dashboard state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Derive supervisor initials for avatar
  const displayName = dashboardData.supervisorName || user?.name || 'Amara Perera';
  const getInitials = (name) => {
    if (!name) return 'AP';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatPubId = (id) => {
    if (!id) return 'pub-000';
    return `pub-${String(id).padStart(3, '0')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const reviewsList = dashboardData.recentReviews || [];

  const maxWorkload = 8; // Max tick height for Y-axis

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && <SupervisorSidebar />}
 
       {/* Main Content View */}
       <div className={styles.mainContent}>
           {/* Top Header Bar - replaced with shared DashboardHeader */}
           <DashboardHeader
             onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
             notificationsRoute="/supervisor/notifications"
           />

        {/* Page Body */}
        <main className={styles.pageBody}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbItem}>Home</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbItem}>Supervisor</span>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbActive}>Dashboard</span>
          </div>

          {/* Page Title & Subtitle */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Supervisor Dashboard</h1>
            <p className={styles.pageSubtext}>
              Manage your assigned papers, reviews, and student feedback.
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className={styles.statGrid}>
            {/* Card 1: Assigned Papers */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Assigned Papers</span>
                <span className={styles.statValue}>{dashboardData.assignedPapers}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconBlue}`}>
                <Calendar size={20} />
              </div>
            </div>

            {/* Card 2: Pending Reviews */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Pending Reviews</span>
                <span className={styles.statValue}>{dashboardData.pendingReviews}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconYellow}`}>
                <Sliders size={20} />
              </div>
            </div>

            {/* Card 3: Approved */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Approved</span>
                <span className={styles.statValue}>{dashboardData.approved}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconGreen}`}>
                <CheckCircle2 size={20} />
              </div>
            </div>

            {/* Card 4: Rejected */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Rejected</span>
                <span className={styles.statValue}>{dashboardData.rejected}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconRed}`}>
                <XCircle size={20} />
              </div>
            </div>

            {/* Card 5: Avg Review Time */}
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Avg Review Time</span>
                <span className={styles.statValue}>{dashboardData.avgReviewTime}</span>
              </div>
              <div className={`${styles.statIconWrapper} ${styles.iconBlue}`}>
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* Main 1-Column Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {/* Recent Reviews Table */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>for Recent Reviews</h2>
                <Link to="/supervisor/assigned" className={styles.viewAllLink}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Publication ID</th>
                      <th>Title</th>
                      <th>AUTHOR</th>
                      <th>SUBMITTED AT</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewsList.map((review) => {
                      const pubIdStr = review.formattedPublicationId || formatPubId(review.id);
                      return (
                        <tr key={review.id}>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{pubIdStr}</td>
                          <td className={styles.paperTitleCell}>{review.title}</td>
                          <td className={styles.studentNameCell}>{review.student || 'Amara Perera'}</td>
                          <td>{formatDate(review.submittedAt)}</td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                review.status === 'APPROVED'
                                  ? styles.statusApproved
                                  : review.status === 'PENDING' || review.status === 'SUBMITTED' || review.status === 'UNDER_REVIEW'
                                  ? styles.statusPending
                                  : styles.statusRejected
                              }`}
                            >
                              {review.status === 'PENDING' || review.status === 'SUBMITTED' ? 'UNDER REVIEW' : review.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className={styles.reviewBtn}
                              onClick={() => navigate(`/supervisor/review/${pubIdStr.toLowerCase()}`)}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <span>&copy; 2026 ResearchSphere &mdash; Student Research Publication Repository.</span>
          <span>v1.0 proto</span>
        </footer>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
