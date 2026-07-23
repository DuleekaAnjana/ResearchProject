import { useState } from 'react';
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

import {
  studentProfile,
  studentStats,
  monthlyActivity,
  approvalTrend,
  recentSubmissions,
  recentActivity,
  continueWhereYouLeftOff
} from '../../data/studentDashboardData';

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
    default:
      return <BookOpen size={20} />;
  }
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
                Welcome back, {studentProfile.name.split(' ')[0]}
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
            {studentStats.map((stat) => (
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
                </div>
                <div
                  className={`${styles.statIconWrapper} ${styles[stat.variant]}`}
                >
                  {renderStatIcon(stat.icon)}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className={styles.chartsSection}>
            {/* Monthly Activity Line Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Monthly activity</h3>
                  <p className={styles.chartSubtitle}>
                    Submissions vs. engagement over the last 6 months.
                  </p>
                </div>
                <button
                  className={styles.analyticsLinkBtn}
                  onClick={() => setActiveTab('analytics')}
                >
                  Go to Analytics <ArrowRight size={14} />
                </button>
              </div>

              {/* Line SVG Chart */}
              <div className={styles.svgChartContainer}>
                <svg
                  viewBox="0 0 500 180"
                  className={styles.lineChartSvg}
                  preserveAspectRatio="none"
                >
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="4" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeDasharray="4" />
                  <line x1="0" y1="170" x2="500" y2="170" stroke="#e2e8f0" />

                  {/* Y-Axis Labels */}
                  <text x="5" y="32" fill="#94a3b8" fontSize="10">2200</text>
                  <text x="5" y="82" fill="#94a3b8" fontSize="10">1650</text>
                  <text x="5" y="132" fill="#94a3b8" fontSize="10">1100</text>
                  <text x="5" y="172" fill="#94a3b8" fontSize="10">0</text>

                  {/* Views Line (Blue Curve) */}
                  <path
                    d="M 40 155 Q 120 140, 200 120 T 360 70 T 480 30"
                    fill="none"
                    stroke="#1e40af"
                    strokeWidth="2.5"
                  />

                  {/* Downloads Line (Teal Curve) */}
                  <path
                    d="M 40 168 Q 120 162, 200 156 T 360 148 T 480 138"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />

                  {/* X-Axis Ticks */}
                  {monthlyActivity.months.map((m, i) => (
                    <text
                      key={m}
                      x={40 + i * 88}
                      y="180"
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {m}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Approval Trend Bar Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Approval trend</h3>
                  <p className={styles.chartSubtitle}>
                    Submissions accepted per month.
                  </p>
                </div>
              </div>

              <div className={styles.barChartContainer}>
                {approvalTrend.map((item) => {
                  // Max count is 4 in our data, calculate bar height percentage
                  const heightPercent = (item.count / 4) * 80;
                  return (
                    <div key={item.month} className={styles.barCol}>
                      <div
                        className={styles.barFill}
                        style={{ height: `${heightPercent}%` }}
                        title={`${item.count} approved`}
                      />
                      <span className={styles.barLabel}>{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submissions & Recent Activity Grid */}
          <div className={styles.activityGrid}>
            {/* Recent Submissions */}
            <div className={styles.submissionsCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Recent submissions</h3>
                <Link to="/student/status" className={styles.viewAllLink}>
                  View all
                </Link>
              </div>

              <div className={styles.submissionsList}>
                {recentSubmissions.map((paper) => (
                  <div key={paper.id} className={styles.submissionRow}>
                    <div className={styles.submissionInfo}>
                      <h4 className={styles.submissionTitle}>{paper.title}</h4>
                      <span className={styles.submissionMeta}>
                        {paper.category} · {paper.pages} pages
                      </span>
                    </div>
                    <span className={styles.badgeApproved}>
                      {paper.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.submissionsCard}>
              <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Recent activity</h3>
              </div>

              <div className={styles.activityFeed}>
                {recentActivity.map((act) => (
                  <div key={act.id} className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityTextGroup}>
                      <span className={styles.activityText}>{act.text}</span>
                      <span className={styles.activityTime}>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Where You Left Off */}
          <div className={styles.continueSection}>
            <div className={styles.continueHeader}>
              <h2 className={styles.continueTitle}>Continue where you left off</h2>
              <p className={styles.continueSubtitle}>
                Your latest publications and drafts.
              </p>
            </div>

            <div className={styles.continueGrid}>
              {continueWhereYouLeftOff.map((item) => (
                <div key={item.id} className={styles.continueCard}>
                  <div className={styles.continueCardTop}>
                    <div className={styles.cardTagsRow}>
                      <span className={styles.categoryTag}>{item.tag}</span>
                      <span className={styles.badgeApproved}>{item.status}</span>
                    </div>

                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardAbstract}>{item.abstract}</p>

                    <div className={styles.cardMetaRow}>
                      <span className={styles.metaItem}>
                        <Calendar size={13} /> {item.date}
                      </span>
                      <span className={styles.metaItem}>
                        <File size={13} /> {item.pages} pages
                      </span>
                      <span className={styles.metaItem}>
                        <Eye size={13} /> {item.views}
                      </span>
                      <span className={styles.metaItem}>
                        <Download size={13} /> {item.downloads}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.actionBtn} ${styles.primary}`}
                      onClick={() => navigate(`/student/publication/${item.id}`)}
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.secondary}`}
                      onClick={() => alert(`Downloading ${item.title}...`)}
                    >
                      <Download size={13} /> Download
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.publish}`}
                      onClick={() => navigate('/student/upload')}
                    >
                      <Send size={13} /> Publish
                    </button>
                  </div>
                </div>
              ))}
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
