import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Search, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import SupervisorSidebar from '../../components/layout/SupervisorSidebar';
import styles from './AssignedPapers.module.css';

const AssignedPapers = ({ filterStatus }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Hardcoded subcategories matching category
  const subcategories = [
    'Artificial Intelligence',
    'Machine Learning',
    'Cyber Security',
    'Data Science',
    'Software Engineering',
    'Human-Computer Interaction',
    'Internet of Things',
    'Cloud Computing',
    'Cardiovascular Medicine',
    'Radiology & Imaging',
    'Pathology',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Robotics & Automation',
    'Electrical Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'Renewable Energy Systems'
  ];

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const email = user?.email || 'demo@researchsphere.edu';
        const data = await api.get(`/papers/supervisor?email=${encodeURIComponent(email)}`);
        setPapers(data || []);
      } catch (err) {
        console.error('Failed to fetch assigned papers:', err);
        setErrorMsg('Failed to load assigned papers. Using local demo data.');
        // Fallback demo papers
        setPapers([
          { publicationId: 1, title: 'Transformer-Based Approaches for Low-Resource Sinhala NLP', studentName: 'Amara Perera', submittedAt: '2026-05-25T10:00:00', status: 'APPROVED', subcategory: 'Artificial Intelligence', keywords: 'Sinhala, NLP' },
          { publicationId: 2, title: 'Federated Learning for Privacy-Preserving Medical Imaging', studentName: 'Amara Perera', submittedAt: '2026-05-28T10:00:00', status: 'APPROVED', subcategory: 'Machine Learning', keywords: 'Federated, Medical' },
          { publicationId: 3, title: 'A Bayesian Framework for Rainfall Prediction in South Asia', studentName: 'Amara Perera', submittedAt: '2026-05-31T10:00:00', status: 'APPROVED', subcategory: 'Data Science', keywords: 'Rainfall, Bayesian' },
          { publicationId: 4, title: 'Blockchain-Backed Digital Credentials for University Certifications', studentName: 'Amara Perera', submittedAt: '2026-06-03T10:00:00', status: 'APPROVED', subcategory: 'Cyber Security', keywords: 'Blockchain, Credentials' },
          { publicationId: 5, title: 'Deep Reinforcement Learning for Autonomous Warehouse Robotics', studentName: 'Amara Perera', submittedAt: '2026-06-06T10:00:00', status: 'APPROVED', subcategory: 'Robotics & Automation', keywords: 'Reinforcement, Robotics' },
          { publicationId: 6, title: 'Solar-Powered Micro-Irrigation Systems for Smallholder Farms', studentName: 'Amara Perera', submittedAt: '2026-06-09T10:00:00', status: 'APPROVED', subcategory: 'Renewable Energy Systems', keywords: 'Solar, Irrigation' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [user]);

  // Date Helper
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

  // Helper to pad/format the publicationId into pub-001 format
  const formatPubId = (id) => {
    if (!id) return 'pub-000';
    return `pub-${String(id).padStart(3, '0')}`;
  };

  // Filtering & Sorting logic
  const filteredPapers = papers
    .filter((paper) => {
      // Status Filter based on filterStatus prop
      if (filterStatus === 'PENDING') {
        const isPending = paper.status === 'PENDING' || paper.status === 'SUBMITTED' || paper.status === 'UNDER_REVIEW';
        if (!isPending) return false;
      } else if (filterStatus === 'APPROVED') {
        if (paper.status !== 'APPROVED') return false;
      } else if (filterStatus === 'REJECTED') {
        if (paper.status !== 'REJECTED') return false;
      }

      // 1. Search Query Filter (Keyword, Title, or Student Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = paper.title?.toLowerCase().includes(query);
        const matchesStudent = paper.studentName?.toLowerCase().includes(query);
        const matchesKeywords = paper.keywords?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesStudent && !matchesKeywords) {
          return false;
        }
      }

      // 2. Subcategory Filter
      if (selectedSubcategory) {
        if (paper.subcategory !== selectedSubcategory) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return timeB - timeA;
      } else if (sortOrder === 'oldest') {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return timeA - timeB;
      } else if (sortOrder === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

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
            <span className={styles.breadcrumbActive}>
              {filterStatus === 'PENDING' ? 'Pending Reviews' : filterStatus === 'APPROVED' ? 'Approved' : filterStatus === 'REJECTED' ? 'Rejected' : 'Assigned'}
            </span>
          </div>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              {filterStatus === 'PENDING' ? 'Pending Reviews' : filterStatus === 'APPROVED' ? 'Approved Papers' : filterStatus === 'REJECTED' ? 'Rejected Papers' : 'Assigned papers'}
            </h1>
            <p className={styles.pageSubtext}>
              {filterStatus === 'PENDING' ? 'Papers currently under your review.' : filterStatus === 'APPROVED' ? 'Your approved research papers.' : filterStatus === 'REJECTED' ? 'Your rejected research papers.' : 'Every paper currently in your queue.'}
            </p>
          </div>

          {/* Search box & Dropdown filters in a single aligned line */}
          <div className={styles.toolbarRow}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by title, author, or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Sub Categories</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>

          {/* Table Card */}
          <div className={styles.card}>
            {loading ? (
              <div className={styles.loadingWrapper}>
                <div className={styles.spinner}></div>
                <p>Loading assigned papers...</p>
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className={styles.emptyState}>
                <FileText size={48} className={styles.emptyIcon} />
                <h3>No papers found</h3>
                <p>No papers match your search queries or filters.</p>
              </div>
            ) : (
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
                    {filteredPapers.map((paper) => {
                      const pubIdStr = paper.formattedPublicationId || formatPubId(paper.publicationId || paper.id);
                      return (
                        <tr key={paper.publicationId || paper.id}>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{pubIdStr}</td>
                          <td className={styles.paperTitleCell}>{paper.title}</td>
                          <td className={styles.studentNameCell}>{paper.studentName || 'Amara Perera'}</td>
                          <td>{formatDate(paper.submittedAt)}</td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                paper.status === 'APPROVED'
                                  ? styles.statusApproved
                                  : paper.status === 'PENDING' || paper.status === 'SUBMITTED' || paper.status === 'UNDER_REVIEW'
                                  ? styles.statusPending
                                  : styles.statusRejected
                              }`}
                            >
                              {paper.status === 'PENDING' || paper.status === 'SUBMITTED' ? 'UNDER REVIEW' : paper.status}
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
            )}
          </div>
        </main>

        <footer className={styles.footer}>
          <span>&copy; 2026 ResearchSphere &mdash; Student Research Publication Repository.</span>
          <span>v1.0 prototype</span>
        </footer>
      </div>
    </div>
  );
};

export default AssignedPapers;
