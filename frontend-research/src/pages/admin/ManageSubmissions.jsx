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
      const papersData = await api.get('/admin/dashboard');
      if (papersData && papersData.latestSubmissions) {
        // Fetch all papers since latest 10 is only on dashboard. Let's use getPapers list if available, 
        // otherwise default to dashboard submissions. Let's also fetch general papers just in case.
        setPapers(papersData.latestSubmissions);
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

  const filteredPapers = papers.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      (p.studentName && p.studentName.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
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

          <div className={styles.controlsRow}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by title, student, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.refreshBtn} onClick={fetchData} title="Refresh submissions">
              <RefreshCw size={16} />
            </button>
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
                  ) : filteredPapers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    filteredPapers.map((paper) => (
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
