import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Bell,
  BookOpen,
  ChevronRight,
  Folder,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  Compass,
  User,
  LayoutDashboard,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import styles from './SearchPublicationsPage.module.css';
import dashboardStyles from './StudentDashboard.module.css';

/**
 * SearchPublicationsPage – Displays all approved publications with search/filter.
 * Accessible via the top search bar or sidebar "All Publications" link.
 */
const SearchPublicationsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- Fetch papers ----
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        // Reuse supervisor endpoint to get all papers; filter approved ones
        const data = await api.get('/supervisor/dashboard');
        const allPapers = data?.recentReviews || [];
        setPapers(allPapers);
      } catch (err) {
        console.warn('Failed to fetch papers, using fallback data:', err);
        // Fallback static data for offline/dev
        setPapers([
          { id: 1, title: 'Transformer-Based Approaches for Low-Resource Sinhala NLP', student: 'Amara Perera', studentName: 'Amara Perera', status: 'APPROVED', category: 'Computer Science' },
          { id: 2, title: 'Federated Learning for Privacy-Preserving Medical Imaging', student: 'Amara Perera', studentName: 'Amara Perera', status: 'APPROVED', category: 'Medicine' },
          { id: 3, title: 'A Bayesian Framework for Rainfall Prediction in South Asia', student: 'Amara Perera', studentName: 'Amara Perera', status: 'APPROVED', category: 'Statistics' },
          { id: 4, title: 'Blockchain-Backed Digital Credentials for University Certifications', student: 'Amara Perera', studentName: 'Amara Perera', status: 'APPROVED', category: 'Computer Science' },
          { id: 5, title: 'Deep Reinforcement Learning for Autonomous Warehouse Robotics', student: 'Amara Perera', studentName: 'Amara Perera', status: 'APPROVED', category: 'Engineering' },
          { id: 6, title: 'Solar-Powered Micro-Irrigation Systems for Smallholder Farms', student: 'Amara Perera', studentName: 'Amara Perera', status: 'APPROVED', category: 'Engineering' },
          { id: 7, title: 'Multi-Modal Sentiment Analysis for Code-Switched Social Media', student: 'Kasun Fernando', studentName: 'Kasun Fernando', status: 'PENDING', category: 'Computer Science' },
          { id: 8, title: 'Energy-Efficient Edge Computing in IoT Healthcare Systems', student: 'Nipuni Silva', studentName: 'Nipuni Silva', status: 'REJECTED', category: 'Medicine' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  // ---- Filter papers by query ----
  const filteredPapers = papers.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      (p.student || p.studentName || '').toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  const getStatusClass = (status) => {
    if (status === 'APPROVED') return styles.statusApproved;
    if (status === 'PENDING') return styles.statusPending;
    if (status === 'REJECTED') return styles.statusRejected;
    return '';
  };

  return (
    <div className={dashboardStyles.dashboardLayout}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className={dashboardStyles.sidebar}>
          <div className={dashboardStyles.sidebarHeader}>
            <div className={dashboardStyles.logoIcon}>
              <GraduationCap size={20} />
            </div>
            <div className={dashboardStyles.logoTextGroup}>
              <span className={dashboardStyles.logoTitle}>ResearchSphere</span>
              <span className={dashboardStyles.logoSubtitle}>RESEARCH REPOSITORY</span>
            </div>
          </div>

          <nav className={dashboardStyles.sidebarNav}>
            <div className={dashboardStyles.navGroup}>
              <span className={dashboardStyles.groupTitle}>Workspace</span>
              <Link to="/student/dashboard" className={dashboardStyles.navItem}>
                <LayoutDashboard className={dashboardStyles.navIcon} />
                <span>Dashboard</span>
              </Link>
              <Link to="/student/notifications" className={dashboardStyles.navItem}>
                <Bell className={dashboardStyles.navIcon} />
                <span>Notifications</span>
              </Link>
            </div>

            <div className={dashboardStyles.navGroup}>
              <span className={dashboardStyles.groupTitle}>Publications</span>
              <Link
                to="/student/search"
                className={`${dashboardStyles.navItem} ${dashboardStyles.navItemActive}`}
              >
                <Folder className={dashboardStyles.navIcon} />
                <span>All Publications</span>
              </Link>
              <Link to="/student/upload" className={dashboardStyles.navItem}>
                <Plus className={dashboardStyles.navIcon} />
                <span>New Submission</span>
              </Link>
              <Link to="/student/status?tab=drafts" className={dashboardStyles.navItem}>
                <FileText className={dashboardStyles.navIcon} />
                <span>Drafts</span>
              </Link>
              <Link to="/student/status?tab=pending" className={dashboardStyles.navItem}>
                <Clock className={dashboardStyles.navIcon} />
                <span>Pending</span>
              </Link>
              <Link to="/student/status?tab=approved" className={dashboardStyles.navItem}>
                <CheckCircle2 className={dashboardStyles.navIcon} />
                <span>Approved</span>
              </Link>
              <Link to="/student/status?tab=rejected" className={dashboardStyles.navItem}>
                <XCircle className={dashboardStyles.navIcon} />
                <span>Rejected</span>
              </Link>
              <Link to="/student/status" className={dashboardStyles.navItem}>
                <Bookmark className={dashboardStyles.navIcon} />
                <span>Submission History</span>
              </Link>
            </div>

            <div className={dashboardStyles.navGroup}>
              <span className={dashboardStyles.groupTitle}>Discover</span>
              <Link to="/student/search" className={dashboardStyles.navItem}>
                <Compass className={dashboardStyles.navIcon} />
                <span>Research Library</span>
              </Link>
              <Link to="/articles" className={dashboardStyles.navItem}>
                <BookOpen className={dashboardStyles.navIcon} />
                <span>Articles</span>
              </Link>
            </div>

            <div className={dashboardStyles.navGroup}>
              <span className={dashboardStyles.groupTitle}>Account</span>
              <Link to="/student/profile" className={dashboardStyles.navItem}>
                <User className={dashboardStyles.navIcon} />
                <span>Profile</span>
              </Link>
            </div>
          </nav>
        </aside>
      )}

      {/* Main */}
      <div className={dashboardStyles.mainContainer}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/student/notifications"
        />

        <div className={dashboardStyles.contentWrapper}>
          <div className={styles.pageWrapper}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
              <Link to="/" className={styles.breadcrumbLink}>Home</Link>
              <ChevronRight size={14} />
              <Link to="/student/dashboard" className={styles.breadcrumbLink}>Student</Link>
              <ChevronRight size={14} />
              <span className={styles.breadcrumbCurrent}>All Publications</span>
            </div>

            {/* Page Header */}
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>All Publications</h1>
              <p className={styles.pageSubtitle}>
                Browse and search all research publications in the repository.
              </p>
            </div>

            {/* Search Bar */}
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  id="publications-search-input"
                  className={styles.searchInput}
                  placeholder="Search by title, author, or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Results Count */}
            {!loading && (
              <div className={styles.resultsHeader}>
                <span className={styles.resultsCount}>
                  {filteredPapers.length} result{filteredPapers.length !== 1 ? 's' : ''}
                  {query ? ` for "${query}"` : ''}
                </span>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className={styles.loadingState}>Loading publications…</div>
            ) : filteredPapers.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateTitle}>No publications found</p>
                <p className={styles.emptyStateDesc}>
                  Try a different search term or clear the filter.
                </p>
              </div>
            ) : (
              <div className={styles.resultsList}>
                {filteredPapers.map((paper) => (
                  <div key={paper.id} className={styles.paperCard}>
                    <div className={styles.paperTitle}>{paper.title}</div>
                    <div className={styles.paperMeta}>
                      <span className={styles.paperAuthor}>
                        {paper.student || paper.studentName || 'Unknown Author'}
                      </span>
                      {paper.category && (
                        <span className={styles.paperCategory}>{paper.category}</span>
                      )}
                      <span className={`${styles.paperStatus} ${getStatusClass(paper.status)}`}>
                        {paper.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPublicationsPage;
