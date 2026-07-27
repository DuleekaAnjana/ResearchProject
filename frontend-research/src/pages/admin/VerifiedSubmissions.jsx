import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './ManageSubmissions.module.css';

const VerifiedSubmissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('Newest');

  const getStatusBadge = (paper) => {
    return <span className={`${styles.statusBadge} ${styles.statusVerified}`}>VERIFIED</span>;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/papers?status=VERIFIED');
      if (data) {
        setPapers(data);
      }
    } catch (err) {
      console.error('Error fetching verified papers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // Filter and sort
  const filteredPapers = papers.filter((paper) => {
    // Category filter
    if (selectedCategory && selectedCategory !== 'All Category' && paper.category !== selectedCategory) {
      return false;
    }
    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (paper.title || '').toLowerCase().includes(q) ||
      (paper.studentName || '').toLowerCase().includes(q) ||
      (paper.formattedPublicationId || '').toLowerCase().includes(q) ||
      (paper.category || '').toLowerCase().includes(q) ||
      (paper.keywords || '').toLowerCase().includes(q)
    );
  });

  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (sortBy === 'Newest') return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
    if (sortBy === 'Oldest') return new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0);
    if (sortBy === 'A-Z') return (a.title || '').localeCompare(b.title || '');
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
            <span className={styles.breadcrumbActive}>Verified Submissions</span>
          </div>

          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Verified Submissions</h1>
              <p className={styles.pageSubtext}>
                Papers that have completed originality check successfully and are assigned or ready.
              </p>
            </div>
          </div>

          {/* Search Filter Card */}
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                onClick={fetchData}
                title="Refresh submissions"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.5rem 1rem',
                flex: 4, minWidth: '280px', backgroundColor: '#f8fafc'
              }}>
                <Search size={18} style={{ color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search title, author, publication id, keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '0.875rem', color: '#0f172a' }}
                />
              </div>
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: '1px solid #ca8a04', borderRadius: '12px', padding: '0.625rem 1rem',
                  backgroundColor: '#ffffff', fontSize: '0.875rem', color: '#0f172a',
                  minWidth: '140px', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
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
                        No verified submissions found.
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
        </main>
      </div>
    </div>
  );
};

export default VerifiedSubmissions;
