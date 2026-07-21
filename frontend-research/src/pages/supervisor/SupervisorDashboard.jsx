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

  const reviewsList = dashboardData.recentReviews && dashboardData.recentReviews.length > 0
    ? dashboardData.recentReviews
    : [
        { id: 1, title: 'Transformer-Based Approaches for Low-Resource Sinhala NLP', student: 'Amara Perera', status: 'APPROVED' },
        { id: 2, title: 'Federated Learning for Privacy-Preserving Medical Imaging', student: 'Amara Perera', status: 'APPROVED' },
        { id: 3, title: 'A Bayesian Framework for Rainfall Prediction in South Asia', student: 'Amara Perera', status: 'APPROVED' },
        { id: 4, title: 'Blockchain-Backed Digital Credentials for University Certifications', student: 'Amara Perera', status: 'APPROVED' },
        { id: 5, title: 'Deep Reinforcement Learning for Autonomous Warehouse Robotics', student: 'Amara Perera', status: 'APPROVED' },
        { id: 6, title: 'Solar-Powered Micro-Irrigation Systems for Smallholder Farms', student: 'Amara Perera', status: 'APPROVED' },
      ];

  const workloadData = dashboardData.weeklyWorkload || { Mon: 3, Tue: 5, Wed: 2, Thu: 6, Fri: 4, Sat: 1, Sun: 0 };
  const maxWorkload = 8; // Max tick height for Y-axis

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar Navigation */}
      {sidebarOpen && (
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
              
              <button
                className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard className={styles.navIcon} />
                <span>Dashboard</span>
              </button>

              <button
                className={`${styles.navItem} ${activeTab === 'assigned' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('assigned')}
              >
                <FileText className={styles.navIcon} />
                <span>Assigned Papers</span>
              </button>

              <button
                className={`${styles.navItem} ${activeTab === 'pending' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <Clock className={styles.navIcon} />
                <span>Pending Reviews</span>
              </button>

              <button
                className={`${styles.navItem} ${activeTab === 'approved' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('approved')}
              >
                <CheckCircle2 className={styles.navIcon} />
                <span>Approved</span>
              </button>

              <button
                className={`${styles.navItem} ${activeTab === 'rejected' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('rejected')}
              >
                <XCircle className={styles.navIcon} />
                <span>Rejected</span>
              </button>

              <button
                className={`${styles.navItem} ${activeTab === 'analytics' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <Sliders className={styles.navIcon} />
                <span>Analytics</span>
              </button>

              <button
                className={`${styles.navItem} ${activeTab === 'notifications' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className={styles.navIcon} />
                <span>Notifications</span>
              </button>
            </div>

            {/* Account Section */}
            <div className={styles.navGroup}>
              <span className={styles.groupTitle}>Account</span>
              <button
                className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <User className={styles.navIcon} />
                <span>Profile</span>
              </button>
            </div>
          </nav>
        </aside>
      )}

      {/* Main Content View */}
      <div className={styles.mainContent}>
        {/* Top Header Bar */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button
              className={styles.toggleBtn}
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle Sidebar"
            >
              <PanelLeft size={20} />
            </button>

            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search papers, authors, categories..."
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.headerRight}>
            <button className={styles.notificationBtn} aria-label="Notifications">
              <Bell size={20} />
              <span className={styles.notificationBadge}>2</span>
            </button>

            <div className={styles.profilePill}>
              <div className={styles.avatarCircle}>{getInitials(displayName)}</div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{displayName}</span>
                <span className={styles.profileRole}>Supervisor</span>
              </div>
            </div>
          </div>
        </header>

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

          {/* Main 2-Column Section */}
          <div className={styles.mainGrid}>
            {/* Left Card: Recent Reviews Table */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Recent reviews</h2>
                <Link to="/supervisor/assigned" className={styles.viewAllLink}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewsList.map((review) => (
                      <tr key={review.id}>
                        <td className={styles.paperTitleCell}>{review.title}</td>
                        <td className={styles.studentNameCell}>{review.student || 'Amara Perera'}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              review.status === 'APPROVED'
                                ? styles.statusApproved
                                : review.status === 'PENDING'
                                ? styles.statusPending
                                : styles.statusRejected
                            }`}
                          >
                            {review.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.reviewBtn}
                            onClick={() => navigate(`/supervisor/review/${review.id}`)}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Card: Weekly Workload Bar Chart */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Weekly workload</h2>
              </div>

              <div className={styles.chartContainer}>
                <div className={styles.chartWrapper}>
                  {/* Y-Axis Ticks */}
                  <div className={styles.yAxis}>
                    <span>8</span>
                    <span>6</span>
                    <span>4</span>
                    <span>2</span>
                    <span>0</span>
                  </div>

                  {/* Bars */}
                  <div className={styles.chartGrid}>
                    {Object.entries(workloadData).map(([day, val]) => {
                      const heightPercent = Math.min(100, (val / maxWorkload) * 100);
                      return (
                        <div key={day} className={styles.barCol}>
                          <div
                            className={styles.barFill}
                            style={{ height: `${heightPercent}%` }}
                            title={`${day}: ${val} papers`}
                          />
                          <span className={styles.dayLabel}>{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
