import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './ManageSubmissions.module.css';

const NoSupervisorsSubmissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState([]);

  const getStatusBadge = (paper) => {
    return <span className={`${styles.statusBadge} ${styles.statusNoSupervisor}`}>SUPERVISOR UNAVAILABLE</span>;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/papers?status=SUPERVISOR_UNAVAILABLE');
      if (data) {
        setPapers(data);
      }
    } catch (err) {
      console.error('Error fetching no supervisor papers:', err);
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
            <span className={styles.breadcrumbActive}>No Supervisors Available</span>
          </div>

          <div className={styles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className={styles.pageTitle}>No Supervisors Available</h1>
              <p className={styles.pageSubtext}>
                Submissions that have been marked as supervisor unavailable.
              </p>
            </div>
            <button className={styles.refreshBtn} onClick={fetchData} title="Refresh submissions">
              <RefreshCw size={16} />
            </button>
          </div>

          <div className={styles.card} style={{ marginTop: '1.5rem' }}>
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
                  ) : papers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No supervisor unavailable submissions found.
                      </td>
                    </tr>
                  ) : (
                    papers.map((paper) => (
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

export default NoSupervisorsSubmissions;
