import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Eye,
  Download,
  File,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StudentSidebar from '../../components/layout/StudentSidebar';
import StudentFooter from '../../components/layout/StudentFooter';
import dashboardStyles from './StudentDashboard.module.css';
import pubCardStyles from './AllPublicationsPage.module.css';

const SubmissionStatusPage = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'pending';
  const displayTabName = tab.charAt(0).toUpperCase() + tab.slice(1);

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [publishConfirmPaper, setPublishConfirmPaper] = useState(null);
  const [deleteConfirmPaper, setDeleteConfirmPaper] = useState(null);
  const [alertPopup, setAlertPopup] = useState(null);

  // ---- Fetch student papers ----
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const email = user?.email || 'student@researchsphere.edu';
        const data = await api.get(`/papers/student?email=${encodeURIComponent(email)}`);
        setPapers(data || []);
      } catch (err) {
        console.warn('Failed to fetch student papers:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) {
      fetchPapers();
    }
  }, [user]);

  // ---- Filter papers based on status query parameter ----
  const filteredPapers = papers.filter((paper) => {
    const status = (paper.status || 'PENDING').toUpperCase();
    if (tab === 'approved') {
      return status === 'APPROVED';
    } else if (tab === 'pending') {
      return status === 'PENDING' || status === 'UNDER REVIEW';
    } else if (tab === 'rejected') {
      return status === 'REJECTED';
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const s = status || 'PENDING';
    if (s === 'APPROVED') {
      return (
        <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckCircle2 size={12} /> APPROVED
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <XCircle size={12} /> REJECTED
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef9c3', color: '#a16207', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <Clock size={12} /> UNDER REVIEW
      </span>
    );
  };

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

  const handleDownload = (paper) => {
    const docInfo = `
%PDF-1.4
% ResearchSphere Manuscript PDF File
Title: ${paper.title}
Author: ${paper.studentName || 'Registered Student'}
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

  return (
    <div className={dashboardStyles.dashboardLayout}>
      {sidebarOpen && <StudentSidebar />}
      <div className={dashboardStyles.mainContainer}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationsRoute="/student/notifications"
        />
        <div 
          className={dashboardStyles.contentWrapper} 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 'calc(100vh - 64px)', 
            justifyContent: 'space-between' 
          }}
        >
          <div 
            style={{ 
              padding: '2rem', 
              background: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              marginTop: '1rem',
              flex: 1
            }}
          >
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
              {displayTabName} Submissions
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5', marginBottom: '2rem' }}>
              Every paper you've authored — drafts, submissions, and approvals.
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Loading submissions…
              </div>
            ) : filteredPapers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                <FileText size={48} style={{ margin: '0 auto 1rem auto', color: '#94a3b8' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>No Submissions Found</h3>
                <p style={{ fontSize: '0.9rem' }}>You do not have any papers currently listed as {displayTabName}.</p>
              </div>
            ) : (
              <div className={pubCardStyles.publicationsGrid}>
                {filteredPapers.map((paper) => {
                  const isApproved = paper.status === 'APPROVED';
                  return (
                    <div key={paper.id} className={pubCardStyles.pubCard}>
                      <div className={pubCardStyles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {paper.formattedPublicationId || `PUB-${paper.id}`}
                        </span>
                        {getStatusBadge(paper.status)}
                      </div>

                      <h3 className={pubCardStyles.pubTitle}>{paper.title}</h3>
                      
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

                      <p className={pubCardStyles.pubAbstract}>
                        {paper.abstractText && paper.abstractText.length > 150 
                          ? `${paper.abstractText.substring(0, 150)}......` 
                          : paper.abstractText}
                      </p>

                      <div className={pubCardStyles.pubMeta}>
                        <span className={pubCardStyles.metaItem}>
                          <Calendar size={14} />
                          {formatDate(paper.submittedAt || paper.reviewedAt)}
                        </span>
                        <span className={pubCardStyles.metaItem}>
                          <FileText size={14} />
                          {paper.pages || 0} pages
                        </span>
                        <span className={pubCardStyles.metaItem}>
                          <Eye size={14} />
                          {paper.views || 0}
                        </span>
                        <span className={pubCardStyles.metaItem}>
                          <Download size={14} />
                          {paper.downloads || 0}
                        </span>
                      </div>

                      <div className={pubCardStyles.cardActions}>
                        <button
                          type="button"
                          onClick={() => setPreviewPaper(paper)}
                          className={`${pubCardStyles.actionBtn} ${pubCardStyles.previewBtn}`}
                          title="Preview manuscript"
                        >
                          <Eye size={14} />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(paper)}
                          className={`${pubCardStyles.actionBtn} ${pubCardStyles.downloadBtn}`}
                          title="Download PDF"
                        >
                          <Download size={14} />
                          Download
                        </button>

                        {isApproved && !paper.isPublished && (
                          <button
                            type="button"
                            onClick={() => setPublishConfirmPaper(paper)}
                            className={`${pubCardStyles.actionBtn} ${pubCardStyles.publishBtn}`}
                            style={{
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem 0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              gridColumn: 'span 3',
                              marginTop: '0.5rem',
                              transition: 'background-color 0.2s'
                            }}
                            title="Publish to Research Library"
                          >
                            <ExternalLink size={14} />
                            Publish Paper
                          </button>
                        )}

                        {isApproved && paper.isPublished && (
                          <div
                            style={{
                              gridColumn: 'span 3',
                              marginTop: '0.5rem',
                              padding: '0.5rem',
                              backgroundColor: '#ecfdf5',
                              color: '#047857',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              textAlign: 'center',
                              border: '1px solid #a7f3d0'
                            }}
                          >
                            PUBLISHED
                          </div>
                        )}

                        {tab === 'pending' && (
                          <div
                            style={{
                              gridColumn: 'span 3',
                              marginTop: '0.5rem',
                              padding: '0.5rem',
                              backgroundColor: '#fffbeb',
                              color: '#d97706',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              textAlign: 'center',
                              border: '1px solid #fde68a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Clock size={12} />
                            Wait Until Review
                          </div>
                        )}

                        {tab === 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmPaper(paper)}
                            style={{
                              gridColumn: 'span 3',
                              marginTop: '0.5rem',
                              padding: '0.5rem',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              transition: 'background-color 0.2s'
                            }}
                            title="Delete submission"
                          >
                            <XCircle size={12} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <StudentFooter />
        </div>
      </div>

      {/* Preview Modal */}
      {previewPaper && (
        <div className={pubCardStyles.modalOverlay} onClick={() => setPreviewPaper(null)}>
          <div className={pubCardStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={pubCardStyles.modalHeader}>
              <div className={pubCardStyles.modalTitleArea}>
                <File size={20} className={pubCardStyles.modalFileIcon} />
                <h3>Document Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPaper(null)}
                className={pubCardStyles.modalCloseBtn}
                title="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className={pubCardStyles.modalBody}>
              <div className={pubCardStyles.pdfPaperFrame}>
                <div className={pubCardStyles.pdfHeader}>
                  <div className={pubCardStyles.pdfHeaderBrand}>ResearchSphere Repository</div>
                  <div className={pubCardStyles.pdfHeaderMeta}>
                    Status: {previewPaper.status} | Pages: {previewPaper.pages || 0}
                  </div>
                </div>

                <div className={pubCardStyles.pdfContent}>
                  <h1 className={pubCardStyles.pdfTitle}>{previewPaper.title}</h1>
                  
                  <div className={pubCardStyles.pdfAuthorLine}>
                    By {previewPaper.studentName || 'Registered Student'}
                  </div>
                  <div className={pubCardStyles.pdfCategoryLine}>
                    Subject Area: {previewPaper.category} {previewPaper.subcategory ? `(${previewPaper.subcategory})` : ''}
                  </div>

                  <div className={pubCardStyles.pdfSection}>
                    <h2 className={pubCardStyles.pdfSectionTitle}>Abstract</h2>
                    <p className={pubCardStyles.pdfParagraph}>{previewPaper.abstractText}</p>
                  </div>

                  {previewPaper.researchGap && (
                    <div className={pubCardStyles.pdfSection}>
                      <h2 className={pubCardStyles.pdfSectionTitle}>Research Gap</h2>
                      <p className={pubCardStyles.pdfParagraph}>{previewPaper.researchGap}</p>
                    </div>
                  )}

                  {previewPaper.keywords && (
                    <div className={pubCardStyles.pdfSection}>
                      <h2 className={pubCardStyles.pdfSectionTitle}>Keywords</h2>
                      <p className={pubCardStyles.pdfKeywords}>{previewPaper.keywords}</p>
                    </div>
                  )}

                  <div className={pubCardStyles.pdfFooter}>
                    Simulated PDF View. Generated on {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className={pubCardStyles.modalFooter}>
              <button
                type="button"
                className={pubCardStyles.modalCloseBtnSecondary}
                onClick={() => setPreviewPaper(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className={pubCardStyles.modalDownloadBtn}
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

      {/* Publish Confirm Modal */}
      {publishConfirmPaper && (
        <div className={pubCardStyles.modalOverlay} onClick={() => setPublishConfirmPaper(null)}>
          <div className={pubCardStyles.modalContent} style={{ maxWidth: '450px', height: 'auto', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div className={pubCardStyles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
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

      {/* Delete Confirm Modal */}
      {deleteConfirmPaper && (
        <div className={pubCardStyles.modalOverlay} onClick={() => setDeleteConfirmPaper(null)}>
          <div className={pubCardStyles.modalContent} style={{ maxWidth: '450px', height: 'auto', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <div className={pubCardStyles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#dc2626' }}>Delete Submission</h3>
              <button type="button" onClick={() => setDeleteConfirmPaper(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem 0' }}>
              <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete the submission <strong>"{deleteConfirmPaper.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmPaper(null)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 600, color: '#374151' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await api.delete(`/papers/${deleteConfirmPaper.id}`);
                    if (res) {
                      setPapers(prev => prev.filter(p => p.id !== deleteConfirmPaper.id));
                      setAlertPopup({
                        type: 'success',
                        title: 'Submission Deleted',
                        message: `"${deleteConfirmPaper.title}" has been successfully deleted.`
                      });
                    }
                  } catch (err) {
                    console.error(err);
                    setAlertPopup({
                      type: 'error',
                      title: 'Delete Failed',
                      message: `Error Details: ${err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err)) || 'Failed to delete submission. Please try again.'}`
                    });
                  } finally {
                    setDeleteConfirmPaper(null);
                  }
                }}
                style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', backgroundColor: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Popup Modal */}
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

export default SubmissionStatusPage;
