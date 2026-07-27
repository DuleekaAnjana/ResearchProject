import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Search,
  CheckCircle,
  AlertCircle,
  UserCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './ManageSubmissions.module.css';

const ManageSubmissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [assignedSupervisorEmail, setAssignedSupervisorEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Category');
  const [sortBy, setSortBy] = useState('Newest');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const papersData = await api.get('/admin/papers');
      if (papersData) {
        setPapers(papersData);
      }
      
      const supsData = await api.get('/admin/supervisors');
      if (supsData) {
        setSupervisors(supsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReview = (paper) => {
    setSelectedPaper(paper);
    setAssignedSupervisorEmail(paper.assignedSupervisorEmail || paper.stuRequestedSupervisorEmail || '');
    setMessage(null);
  };

  const handleCloseReview = () => {
    setSelectedPaper(null);
    setMessage(null);
  };

  const handleCheckDuplicate = async () => {
    if (!selectedPaper) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const updatedPaper = await api.post(`/admin/papers/${selectedPaper.id}/check-duplicate`);
      if (updatedPaper) {
        setSelectedPaper(updatedPaper);
        // Update local list
        setPapers((prev) => prev.map((p) => (p.id === updatedPaper.id ? updatedPaper : p)));
        setMessage({ type: 'success', text: 'Plagiarism check completed and updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to complete duplicate check.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSupervisor = async () => {
    if (!selectedPaper || !assignedSupervisorEmail) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const updatedPaper = await api.post(`/admin/papers/${selectedPaper.id}/assign-supervisor`, {
        supervisorEmail: assignedSupervisorEmail
      });
      if (updatedPaper) {
        setSelectedPaper(updatedPaper);
        // Update local list
        setPapers((prev) => prev.map((p) => (p.id === updatedPaper.id ? updatedPaper : p)));
        setMessage({ type: 'success', text: 'Supervisor assigned successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to assign supervisor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Compute allCategories dynamically
  const allCategories = ['All Category', ...new Set(papers.map(p => p.category).filter(Boolean))];

  const filteredPapers = papers.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        (p.title || '').toLowerCase().includes(q) ||
        (p.studentName || p.student || '').toLowerCase().includes(q) ||
        (p.publicationId ? String(p.publicationId) : '').includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q) ||
        (p.keywords || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedCategory && selectedCategory !== 'All Category') {
      if (p.category !== selectedCategory) return false;
    }
    return true;
  });

  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (sortBy === 'Newest') {
      return new Date(b.publishedAt || b.submittedAt || 0) - new Date(a.publishedAt || a.submittedAt || 0);
    }
    if (sortBy === 'Oldest') {
      return new Date(a.publishedAt || a.submittedAt || 0) - new Date(b.publishedAt || b.submittedAt || 0);
    }
    if (sortBy === 'Most Viewed') {
      return (b.views || 0) - (a.views || 0);
    }
    if (sortBy === 'Most Downloaded') {
      return (b.downloads || 0) - (a.downloads || 0);
    }
    if (sortBy === 'A-Z') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

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
            <span className={styles.breadcrumbActive}>Manage Submissions</span>
          </div>

          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Manage Submissions</h1>
            <p className={styles.pageSubtext}>
              Verify student submissions, perform duplicate checking, and assign supervisors.
            </p>
          </div>

          {/* Search Filter Bar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            {/* Header / Top Row containing Refresh Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                onClick={fetchData}
                title="Refresh submissions"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Row of Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* Search Field */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                flex: 3,
                minWidth: '280px',
                backgroundColor: '#f8fafc'
              }}>
                <Search size={16} style={{ color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search title, author, publication id, subcategory or keyword.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    width: '100%',
                    fontSize: '0.875rem',
                    color: '#0f172a'
                  }}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.625rem 1rem',
                  backgroundColor: '#ffffff',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  minWidth: '160px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: '1px solid #ca8a04',
                  borderRadius: '12px',
                  padding: '0.625rem 1rem',
                  backgroundColor: '#ffffff',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  minWidth: '140px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="Most Viewed">Most Viewed</option>
                <option value="Most Downloaded">Most Downloaded</option>
                <option value="A-Z">A-Z</option>
              </select>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Publication ID</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Submitted At</th>
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
                  ) : sortedPapers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    sortedPapers.map((paper) => (
                      <tr key={paper.id}>
                        <td style={{ fontWeight: 600, color: '#475569' }}>
                          {paper.formattedPublicationId || `PUB-${paper.id}`}
                        </td>
                        <td className={styles.paperTitleCell}>{paper.title}</td>
                        <td className={styles.studentNameCell}>{paper.studentName || 'Registered Student'}</td>
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

          {/* Drawer removed – using review page instead */}
        </main>
      </div>
    </div>
  );
};

export default ManageSubmissions;
