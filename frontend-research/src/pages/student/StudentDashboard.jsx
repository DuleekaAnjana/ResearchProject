import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  PanelLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Eye,
  Download,
  Trophy,
  Plus,
  ArrowRight,
  Calendar,
  File,
  Send,
  LayoutDashboard,
  BarChart3,
  Bookmark,
  Folder,
  Compass,
  User,
  Bell,
  ChevronRight
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { studentProfile } from '../../data/studentDashboardData';
import api from '../../services/api';
import notificationService from '../../services/notificationService';

import DashboardHeader from '../../components/layout/DashboardHeader';
import StudentSidebar from '../../components/layout/StudentSidebar';
import StudentFooter from '../../components/layout/StudentFooter';
import styles from './StudentDashboard.module.css';

/**
 * Helper to render correct stat icon dynamically
 */
const renderStatIcon = (iconName) => {
  switch (iconName) {
    case 'BookOpen':
      return <BookOpen size={20} />;
    case 'CheckCircle2':
      return <CheckCircle2 size={20} />;
    case 'Clock':
      return <Clock size={20} />;
    case 'XCircle':
      return <XCircle size={20} />;
    case 'FileText':
      return <FileText size={20} />;
    case 'Eye':
      return <Eye size={20} />;
    case 'Download':
      return <Download size={20} />;
    case 'Trophy':
      return <Trophy size={20} />;
    case '📢':
      return <span style={{ fontSize: '1.25rem' }}>📢</span>;
    default:
      return <BookOpen size={20} />;
  }
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const [papers, setPapers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankInfo, setRankInfo] = useState({ rank: 1, totalStudents: 1 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const papersData = await api.get(`/papers/student?email=${encodeURIComponent(user.email)}`);
        setPapers(papersData || []);

        const notificationsData = await notificationService.getAll(user.email);
        setActivities(notificationsData || []);

        const rankData = await api.get(`/papers/student/rank?email=${encodeURIComponent(user.email)}`);
        if (rankData) {
          setRankInfo(rankData);
        }
      } catch (err) {
        console.warn('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.email]);

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

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffDays >= 1) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours >= 1) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins >= 1) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getDynamicStats = () => {
    const totalPubs = papers.length;
    const approvedCount = papers.filter(p => p.status === 'APPROVED').length;
    const pendingCount = papers.filter(p => p.status === 'PENDING' || p.status === 'UNDER REVIEW').length;
    const rejectedCount = papers.filter(p => p.status === 'REJECTED').length;
    const publishedCount = papers.filter(p => p.isPublished).length;
    const totalViews = papers.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalDownloads = papers.reduce((sum, p) => sum + (p.downloads || 0), 0);

    return [
      {
        id: 'total_publications',
        label: 'TOTAL SUBMISSIONS',
        value: totalPubs.toString(),
        icon: 'BookOpen',
        variant: 'blue',
      },
      {
        id: 'approved',
        label: 'APPROVED',
        value: approvedCount.toString(),
        icon: 'CheckCircle2',
        variant: 'green',
      },
      {
        id: 'pending',
        label: 'PENDING',
        value: pendingCount.toString(),
        icon: 'Clock',
        variant: 'amber',
      },
      {
        id: 'rejected',
        label: 'REJECTED',
        value: rejectedCount.toString(),
        icon: 'XCircle',
        variant: 'red',
      },
      {
        id: 'published',
        label: 'PUBLISHED',
        value: publishedCount.toString(),
        icon: '📢',
        variant: 'teal',
      },
      {
        id: 'total_views',
        label: 'TOTAL VIEWS',
        value: totalViews.toLocaleString(),
        icon: 'Eye',
        variant: 'purple',
      },
      {
        id: 'downloads',
        label: 'DOWNLOADS',
        value: totalDownloads.toLocaleString(),
        icon: 'Download',
        variant: 'teal',
      },
      {
        id: 'category_rank',
        label: 'CATEGORY RANK',
        value: rankInfo.publishedCount === 0 ? '#N/A' : `#${rankInfo.rank}`,
        subtitle: rankInfo.publishedCount === 0 ? 'Publish first for Rank' : `Ranked ${rankInfo.rank} of ${rankInfo.totalStudents} in ${user?.researchCategory || 'Computer Science'}`,
        extraLine: rankInfo.publishedCount === 0 ? `Ranked 0 of ${rankInfo.totalStudents} in ${user?.researchCategory || 'Computer Science'}` : null,
        icon: 'Trophy',
        variant: 'gold',
      },
    ];
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar Navigation */}
      {sidebarOpen && <StudentSidebar />}

      {/* Main Content Area */}
      <div className={styles.mainContainer}>
        {/* Top Navbar - replaced with shared DashboardHeader */}
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationsRoute="/student/notifications"
        />

        {/* Dashboard Content */}
        <div className={styles.contentWrapper}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumbs}>
            <span>Home</span>
            <ChevronRight size={14} />
            <span>Student</span>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbCurrent}>Dashboard</span>
          </div>

          {/* Welcome Header */}
          <div className={styles.welcomeBanner}>
            <div>
              <h1 className={styles.welcomeTitle}>
                Welcome back, {(user?.name || studentProfile.name).split(' ')[0]}
              </h1>
              <p className={styles.welcomeSubtitle}>
                Here's an overview of your research activity across ResearchSphere.
              </p>
            </div>

            <button
              className={styles.newSubmissionBtn}
              onClick={() => navigate('/student/upload')}
            >
              <Plus size={18} />
              New submission
            </button>
          </div>

          {/* 8 Stat Cards Grid */}
          <div className={styles.statsGrid}>
            {getDynamicStats().map((stat) => (
              <div key={stat.id} className={styles.statCard}>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statValue}>{stat.value}</span>
                  {stat.badge && (
                    <span className={styles.statBadge}>{stat.badge}</span>
                  )}
                  {stat.subtitle && (
                    <span className={styles.statSubtitle}>{stat.subtitle}</span>
                  )}
                  {stat.extraLine && (
                    <span className={styles.statSubtitle} style={{ marginTop: '2px', display: 'block' }}>{stat.extraLine}</span>
                  )}
                </div>
                <div
                  className={`${styles.statIconWrapper} ${styles[stat.variant]}`}
                >
                  {renderStatIcon(stat.icon)}
                </div>
              </div>
            ))}
          </div>

          {/* Submissions & Recent Activity Grid */}
          <div className={styles.activityGrid}>
            {/* Recent Submissions */}
            <div className={styles.submissionsCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Recent Submissions</h3>
                <Link to="/student/status" className={styles.viewAllLink}>
                  View all
                </Link>
              </div>

              <div className={styles.submissionsList}>
                {loading ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>Loading submissions…</div>
                ) : papers.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>No submissions found.</div>
                ) : (
                  [...papers]
                    .sort((a, b) => new Date(b.submittedAt || b.reviewedAt || 0) - new Date(a.submittedAt || a.reviewedAt || 0))
                    .slice(0, 10)
                    .map((paper) => (
                      <div key={paper.id} className={styles.submissionRow}>
                        <div className={styles.submissionInfo}>
                          <h4 className={styles.submissionTitle}>{paper.title}</h4>
                          <span className={styles.submissionMeta}>
                            {paper.category} · {paper.pages || 0} pages
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: paper.status === 'APPROVED' ? '#dcfce7' : paper.status === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                          color: paper.status === 'APPROVED' ? '#15803d' : paper.status === 'REJECTED' ? '#b91c1c' : '#a16207',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {paper.status}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.submissionsCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Recent Activity</h3>
                <Link to="/student/notifications" className={styles.viewAllLink}>
                  View all
                </Link>
              </div>

              <div className={styles.activityFeed}>
                {loading ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>Loading activity…</div>
                ) : activities.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>No recent activity.</div>
                ) : (
                  [...activities]
                    .slice(0, 5)
                    .map((act) => (
                      <div key={act.id} className={styles.activityItem} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        padding: '1rem',
                        border: '1px solid #f1f5f9',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        marginBottom: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                            {act.title}
                          </h4>
                          {!act.read && !act.isRead && (
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '20px',
                              flexShrink: 0
                            }}>
                              New
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.825rem', color: '#475569', lineHeight: 1.4 }}>
                          {act.description}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {getRelativeTime(act.createdAt)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <StudentFooter />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
