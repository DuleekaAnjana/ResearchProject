import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  Eye,
  Download,
  Calendar,
  FileText,
  Trash2,
  AlertCircle,
  X,
  File,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StudentSidebar from '../../components/layout/StudentSidebar';
import StudentFooter from '../../components/layout/StudentFooter';
import styles from './AllPublicationsPage.module.css';
import dashboardStyles from './StudentDashboard.module.css';

const AllPublicationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // ---- Search & Filter State ----
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // ---- Modal Preview State ----
  const [previewPaper, setPreviewPaper] = useState(null);
  const [publishConfirmPaper, setPublishConfirmPaper] = useState(null);
  const [alertPopup, setAlertPopup] = useState(null);

  // ---- Get Student Subcategories based on Registered Subject Path ----
  const studentCategory = user?.researchCategory || 'Computer Science';
  
  const getSubcategories = (category) => {
    switch (category) {
      case 'Computer Science':
        return [
          'Artificial Intelligence',
          'Machine Learning',
          'Cyber Security',
          'Data Science',
          'Software Engineering',
          'Human-Computer Interaction',
          'Internet of Things',
          'Cloud Computing',
        ];
      case 'Medicine':
        return [
          'Cardiovascular Medicine',
          'Radiology & Imaging',
          'Pathology',
          'Neurology',
          'Oncology',
          'Pediatrics',
        ];
      case 'Engineering':
        return [
          'Robotics & Automation',
          'Electrical Engineering',
          'Civil Engineering',
          'Mechanical Engineering',
          'Renewable Energy Systems',
        ];
      default:
        return [
          'General Research',
          'Interdisciplinary Study',
          'Methodological Framework',
        ];
    }
  };

  const relevantSubcategories = getSubcategories(studentCategory);

  // ---- Fetch student papers ----
  const fetchStudentPapers = async () => {
    setLoading(true);
    try {
      const email = user?.email || 'student@researchsphere.edu';
      const data = await api.get(`/papers/student?email=${encodeURIComponent(email)}`);
      setPapers(data || []);
    } catch (err) {
      console.error('Failed to fetch student papers:', err);
      setErrorMsg('Failed to load your publications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentPapers();
  }, [user]);

  // ---- Actions ----
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rejected submission?')) {
      return;
    }
    try {
      await api.delete(`/papers/${id}`);
      setPapers((prev) => prev.filter((p) => p.id !== id));
      alert('Publication deleted successfully.');
    } catch (err) {
      console.error('Failed to delete paper:', err);
      alert('Failed to delete publication. Please try again.');
    }
  };

  const handleDownload = (paper) => {
    // Generate a simulated PDF manuscript
    const docInfo = `
%PDF-1.4
% ResearchSphere Manuscript PDF File
Title: ${paper.title}
Author: ${paper.studentName || user?.name || 'Registered Student'}
Category: ${paper.category || 'General'}
Subcategory: ${paper.subcategory || 'General'}
Pages: ${paper.pages || 0}
Views: ${paper.views || 0}
Downloads: ${paper.downloads || 0}
Submitted At: ${paper.submittedAt || 'N/A'}
Status: ${paper.status}
--------------------------------------------------
Abstract:
${paper.abstractText}

Research Gap:
${paper.researchGap || 'Not specified.'}

Keywords:
${paper.keywords || ''}

Comments:
${paper.comments || ''}
`;
    const blob = new Blob([docInfo], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = paper.pdfFileName || `${paper.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_manuscript.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePublish = (paper) => {
    setPublishConfirmPaper(paper);
  };

  // ---- Date Formatter ----
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

  // ---- Filtering & Sorting Logic ----
  const filteredPapers = papers
    .filter((paper) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = paper.title?.toLowerCase().includes(query);
        const matchesAbstract = paper.abstractText?.toLowerCase().includes(query);
        const matchesKeywords = paper.keywords?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAbstract && !matchesKeywords) {
          return false;
        }
      }
      
      // 2. Subcategory Filter
      if (selectedSubcategory) {
        if (paper.subcategory !== selectedSubcategory) {
          return false;
        }
      }

      // 3. Status Filter (APPROVED, REJECTED, UNDER REVIEW / PENDING)
      if (selectedStatus) {
        if (selectedStatus === 'UNDER_REVIEW') {
          if (paper.status !== 'PENDING' && paper.status !== 'UNDER_REVIEW' && paper.status !== 'SUBMITTED') {
            return false;
          }
        } else {
          if (paper.status !== selectedStatus) {
            return false;
          }
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
      } else if (sortOrder === 'most_downloaded') {
        return (b.downloads || 0) - (a.downloads || 0);
      } else if (sortOrder === 'most_viewed') {
        return (b.views || 0) - (a.views || 0);
      } else if (sortOrder === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

  // Helper to map DB status to UI representation
  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return <span className={`${styles.statusBadge} ${styles.approved}`}>APPROVED</span>;
    }
    if (status === 'REJECTED') {
      return <span className={`${styles.statusBadge} ${styles.rejected}`}>REJECTED</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.underReview}`}>UNDER REVIEW</span>;
  };

  return (
    <div className={dashboardStyles.dashboardLayout}>
      {/* Sidebar Navigation */}
      {sidebarOpen && <StudentSidebar />}

      {/* Main Container */}
      <div className={dashboardStyles.mainContainer}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/student/notifications"
        />

        <div className={dashboardStyles.contentWrapper}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumbs}>
            <Link to="/student/dashboard" className={styles.breadcrumbLink}>Home</Link>
            <ChevronRight size={14} className={styles.breadcrumbDivider} />
            <span className={styles.breadcrumbCurrent}>Submissions</span>
          </div>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>All Submissions</h1>
            <p className={styles.pageSubtitle}>
              Every paper you've authored — drafts, submissions, and approvals.
            </p>
          </div>

          {/* Search and Filters row */}
          <div className={styles.filtersContainer}>
            <div className={styles.searchField}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search title, author, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Sub Categories</option>
              {relevantSubcategories.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most_downloaded">Most downloaded</option>
              <option value="most_viewed">Most Viewed</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className={styles.errorAlert}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Papers Grid */}
          {loading ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner}></div>
              <p>Loading your publications...</p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={48} className={styles.emptyIcon} />
              <h3>No submissions found</h3>
              <p>You haven't submitted any papers matching these filters.</p>
              <Link to="/student/upload" className={styles.submitNewBtn}>
                Submit a new paper
              </Link>
            </div>
          ) : (
            <div className={styles.publicationsGrid}>
              {filteredPapers.map((paper) => {
                const combinedCategory = paper.subcategory
                  ? `${(paper.category || studentCategory).toUpperCase()} - ${paper.subcategory.toUpperCase()}`
                  : (paper.category || studentCategory).toUpperCase();

                const isApproved = paper.status === 'APPROVED';
                const isRejected = paper.status === 'REJECTED';
                const isUnderReview = paper.status === 'PENDING' || paper.status === 'UNDER_REVIEW' || paper.status === 'SUBMITTED';

                return (
                  <div key={paper.id} className={styles.pubCard}>
                    <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {paper.formattedPublicationId || `PUB-${paper.id}`}
                      </span>
                      {getStatusBadge(paper.status)}
                    </div>

                    <h3 className={styles.pubTitle}>{paper.title}</h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        {paper.subcategory || 'General'}
                      </span>
                      {paper.keywords && paper.keywords.trim() && paper.keywords.split(',').map((kw, idx) => (
                        <span key={idx} style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                          {kw.trim()}
                        </span>
                      ))}
                    </div>

                    <p className={styles.pubAbstract}>
                      {paper.abstractText && paper.abstractText.length > 150 
                        ? `${paper.abstractText.substring(0, 150)}......` 
                        : paper.abstractText}
                    </p>

                    <div className={styles.pubMeta}>
                      <span className={styles.metaItem}>
                        <Calendar size={14} />
                        {formatDate(paper.submittedAt || paper.reviewedAt)}
                      </span>
                      <span className={styles.metaItem}>
                        <FileText size={14} />
                        {paper.pages || 0} pages
                      </span>
                      <span className={styles.metaItem}>
                        <Eye size={14} />
                        {paper.views || 0}
                      </span>
                      <span className={styles.metaItem}>
                        <Download size={14} />
                        {paper.downloads || 0}
                      </span>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => setPreviewPaper(paper)}
                        className={`${styles.actionBtn} ${styles.previewBtn}`}
                        title="Preview manuscript"
                      >
                        <Eye size={14} />
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(paper)}
                        className={`${styles.actionBtn} ${styles.downloadBtn}`}
                        title="Download PDF"
                      >
                        <Download size={14} />
                        Download
                      </button>

                      {isApproved && !paper.isPublished && (
                        <button
                          type="button"
                          onClick={() => handlePublish(paper)}
                          className={`${styles.actionBtn} ${styles.publishBtn}`}
                        >
                          Publish
                        </button>
                      )}
                      {isApproved && paper.isPublished && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem' }}>
                          Published
                        </span>
                      )}

                      {isRejected && (
                        <button
                          type="button"
                          onClick={() => handleDelete(paper.id)}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Delete submission"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}

                      {isUnderReview && (
                        <span className={styles.waitLabel}>
                          Wait Untill Review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <StudentFooter />
        </div>
      </div>

      {/* Preview Modal */}
      {previewPaper && (
        <div className={styles.modalOverlay} onClick={() => setPreviewPaper(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <File size={20} className={styles.modalFileIcon} />
                <h3>Document Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPaper(null)}
                className={styles.modalCloseBtn}
                title="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.pdfPaperFrame}>
                <div className={styles.pdfHeader}>
                  <div className={styles.pdfHeaderBrand}>ResearchSphere Repository</div>
                  <div className={styles.pdfHeaderMeta}>
                    Status: {previewPaper.status} | Pages: {previewPaper.pages || 0}
                  </div>
                </div>

                <div className={styles.pdfContent}>
                  <h1 className={styles.pdfTitle}>{previewPaper.title}</h1>
                  
                  <div className={styles.pdfAuthorLine}>
                    By {previewPaper.studentName || user?.name || 'Registered Student'}
                  </div>
                  <div className={styles.pdfCategoryLine}>
                    Subject Area: {previewPaper.category || studentCategory} {previewPaper.subcategory ? `(${previewPaper.subcategory})` : ''}
                  </div>

                  <div className={styles.pdfSection}>
                    <h2 className={styles.pdfSectionTitle}>Abstract</h2>
                    <p className={styles.pdfParagraph}>{previewPaper.abstractText}</p>
                  </div>

                  {previewPaper.researchGap && (
                    <div className={styles.pdfSection}>
                      <h2 className={styles.pdfSectionTitle}>Research Gap</h2>
                      <p className={styles.pdfParagraph}>{previewPaper.researchGap}</p>
                    </div>
                  )}

                  {previewPaper.keywords && (
                    <div className={styles.pdfSection}>
                      <h2 className={styles.pdfSectionTitle}>Keywords</h2>
                      <p className={styles.pdfKeywords}>{previewPaper.keywords}</p>
                    </div>
                  )}

                  <div className={styles.pdfFooter}>
                    Simulated PDF View. Generated on {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCloseBtnSecondary}
                onClick={() => setPreviewPaper(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className={styles.modalDownloadBtn}
                onClick={() => {
                  handleDownload(previewPaper);
                  setPreviewPaper(null);
                }}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {publishConfirmPaper && (
        <div className={styles.modalOverlay} onClick={() => setPublishConfirmPaper(null)}>
          <div className={styles.modalContent} style={{ maxWidth: '450px', height: 'auto', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#111827' }}>Confirm Publication</h3>
              <button type="button" onClick={() => setPublishConfirmPaper(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem 0' }}>
              <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to publish the research paper <strong>"{publishConfirmPaper.title}"</strong> to the Research Library? Once published, it will be visible to everyone.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setPublishConfirmPaper(null)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 600, color: '#374151' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await api.post(`/papers/${publishConfirmPaper.id}/publish`, {});
                    if (res) {
                      setPapers(prev => prev.map(p => p.id === res.id ? res : p));
                      setAlertPopup({
                        type: 'success',
                        title: 'Publication Success',
                        message: `"${publishConfirmPaper.title}" has been successfully published!`
                      });
                    }
                  } catch (err) {
                    console.error(err);
                    setAlertPopup({
                      type: 'error',
                      title: 'Publication Failed',
                      message: `Error Details: ${err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)) || 'Failed to publish. Please try again.'}`
                    });
                  } finally {
                    setPublishConfirmPaper(null);
                  }
                }}
                style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {alertPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', width: '95%', maxWidth: '400px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <button 
              onClick={() => setAlertPopup(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: alertPopup.type === 'success' ? '#16a34a' : '#dc2626', marginBottom: '0.5rem' }}>
              {alertPopup.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {alertPopup.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAlertPopup(null)}
                style={{ padding: '0.5rem 1.25rem', border: 'none', backgroundColor: '#1e293b', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPublicationsPage;
