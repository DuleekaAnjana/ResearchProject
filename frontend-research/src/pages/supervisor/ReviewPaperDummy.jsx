import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Send, AlertCircle, FileText, Check, Clock, ExternalLink, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import SupervisorSidebar from '../../components/layout/SupervisorSidebar';
import styles from './SupervisorDashboard.module.css';

const ReviewPaperDummy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState(null);
  const [supervisors, setSupervisors] = useState([]);

  // Form State
  const [researchDirection, setResearchDirection] = useState('');
  const [researchGapFeedback, setResearchGapFeedback] = useState('');
  const [missingFindings, setMissingFindings] = useState('');
  const [comments, setComments] = useState('');
  const [satisfactionLevel, setSatisfactionLevel] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingDecision, setPendingDecision] = useState(null);

  // Parse numeric ID from "pub-001" or fallback
  const getNumericId = (pubId) => {
    if (!pubId) return 1;
    const clean = pubId.replace('pub-', '');
    const num = parseInt(clean, 10);
    return isNaN(num) ? 1 : num;
  };

  useEffect(() => {
    const fetchPaperDetails = async () => {
      setLoading(true);
      try {
        const supsData = await api.get('/admin/supervisors');
        if (supsData) {
          setSupervisors(supsData);
        }
      } catch (err) {
        console.error('Failed to fetch supervisors:', err);
      }

      try {
        const numericId = getNumericId(id);
        const data = await api.get(`/papers/${numericId}`);
        if (data) {
          setPaper(data);
          const isReviewed = data.status === 'APPROVED' || data.status === 'REJECTED';
          setResearchDirection(isReviewed ? (data.researchDirection || '') : '');
          setResearchGapFeedback(isReviewed ? (data.researchGapFeedback || '') : '');
          setMissingFindings(isReviewed ? (data.missingFindings || '') : '');
          setComments(isReviewed ? (data.comments || '') : '');
          setSatisfactionLevel(isReviewed ? (data.satisfactionLevel || 0) : 0);
        }
      } catch (err) {
        console.error('Failed to fetch paper details, falling back to mock:', err);
        // Realistic Mock Paper
        setPaper({
          id: getNumericId(id),
          title: 'Transformer-Based Approaches for Low-Resource Sinhala NLP',
          studentName: 'Amara Perera',
          studentEmail: 'student@researchsphere.edu',
          supervisorEmail: user?.email || 'demo@researchsphere.edu',
          supervisorName: user?.name || 'Prof. Ranjith Silva',
          status: 'PENDING',
          category: 'Computer Science',
          subcategory: 'Artificial Intelligence',
          abstractText: 'This study investigates transformer-based approaches for low-resource Sinhala NLP, addressing a well-defined research gap through a combination of quantitative analysis, controlled experiments, and comparative benchmarks. The findings demonstrate how scaling factors can improve results.',
          researchGap: 'Limited empirical work and lack of standardized benchmarks in Sinhala NLP.',
          keywords: 'sinhala, transformer, nlp, low-resource',
          pdfFileName: 'transformer-based-approaches-for-low-res.pdf',
          pages: 22,
          submittedAt: '2026-07-06T15:26:00',
          adminValidatedAt: '2026-07-08T15:26:00',
          duplicateCheckedAt: '2026-07-10T15:26:00',
          supervisorAssignedAt: '2026-07-12T15:26:00',
          underReviewAt: '2026-07-14T15:26:00',
          reviewedAt: null,
          publishedAt: null,
          supervisorDesignedAt: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaperDetails();
  }, [id, user]);

  const formatFullDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const pad = (num) => num.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  const getSupervisorNameByEmail = (email) => {
    if (!email) return 'N/A';
    if (email === 'No Supervisor Available') return 'No Supervisor Available';
    const sup = supervisors.find(s => s.email === email);
    return sup ? sup.fullName : email;
  };

  // Date Formatting Helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${formattedDate} - ${formattedTime}`;
  };

  const handleAction = (actionType) => {
    // Reject validation
    if (actionType === 'REJECTED') {
      const hasReason = researchDirection.trim() || researchGapFeedback.trim() || missingFindings.trim() || comments.trim();
      if (!hasReason) {
        alert('Require at least one reason to Reject Reaseach');
        return;
      }
    }

    // Approve validation
    if (actionType === 'APPROVED') {
      if (satisfactionLevel < 2) {
        alert('You need atleast Satisfaction level: 2 / 5 to Approval');
        return;
      }
    }

    setPendingDecision(actionType);
    setShowConfirmPopup(true);
  };

  const handleConfirmDecision = async () => {
    if (!pendingDecision) return;
    setSubmitting(true);
    setShowConfirmPopup(false);
    try {
      const payload = {
        status: pendingDecision,
        researchDirection,
        researchGapFeedback,
        missingFindings,
        comments,
        satisfactionLevel
      };
      
      const numericId = getNumericId(id);
      const updatedPaper = await api.post(`/papers/${numericId}/review`, payload);
      
      if (updatedPaper) {
        setPaper(updatedPaper);
        navigate('/supervisor/assigned');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Update simulated locally.');
      // Local simulated update
      setPaper(prev => ({
        ...prev,
        status: pendingDecision,
        researchDirection,
        researchGapFeedback,
        missingFindings,
        comments,
        satisfactionLevel,
        reviewedAt: new Date().toISOString(),
        supervisorDecideAt: new Date().toISOString()
      }));
      navigate('/supervisor/assigned');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper} style={{ minHeight: '60vh' }}>
        <div className={styles.spinner}></div>
        <p>Loading publication details...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className={styles.errorAlert} style={{ margin: '3rem' }}>
        <AlertCircle />
        <span>Failed to load publication details.</span>
      </div>
    );
  }

  const getTopRightStatusBadge = () => {
    const status = paper.status;
    let label = 'UNDER REVIEW';
    let bg = '#eff6ff';
    let textCol = '#1e40af';
    let borderCol = '#bfdbfe';

    if (status === 'APPROVED') {
      label = 'APPROVED';
      bg = '#f0fdf4';
      textCol = '#047857';
      borderCol = '#a7f3d0';
    } else if (status === 'REJECTED') {
      label = 'REJECTED';
      bg = '#fee2e2';
      textCol = '#991b1b';
      borderCol = '#fca5a5';
    }

    const timeStr = paper.supervisorDesignedAt ? ` | AT ${formatFullDateTime(paper.supervisorDesignedAt)}` : '';

    return (
      <span style={{
        padding: '0.35rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: bg,
        color: textCol,
        border: `1px solid ${borderCol}`,
        display: 'inline-flex',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        {label}{timeStr}
      </span>
    );
  };

  const handleOpenPdf = () => {
    const numericId = getNumericId(id);
    window.open(`${api.defaults.baseURL || '/api'}/papers/${numericId}/pdf`, '_blank');
  };

  const handleDownload = async () => {
    if (!paper) return;
    try {
      const response = await fetch(`${api.defaults.baseURL || '/api'}/papers/${getNumericId(id)}/pdf`);
      if (!response.ok) throw new Error('PDF download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = paper.pdfFileName || `${paper.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_manuscript.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to download PDF.');
    }
  };

  // Derive timeline status states
  const isApproved = paper.status === 'APPROVED';
  const isRejected = paper.status === 'REJECTED';
  const isPending = paper.status === 'PENDING' || paper.status === 'SUBMITTED' || paper.status === 'UNDER_REVIEW';

  const supervisorDisplayName = paper.supervisorName || user?.name || 'Prof. Ranjith Silva';

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && <SupervisorSidebar />}

      <div className={styles.mainContent}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/supervisor/notifications"
        />

        <main className={styles.pageBody} style={{ paddingBottom: '3rem' }}>
          {/* Breadcrumbs (Do not change format) */}
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbItem}>Home</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbItem}>Supervisor</span>
            <ChevronRight size={14} />
            <Link to="/supervisor/assigned" className={styles.breadcrumbItem}>Assigned</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbActive}>Review {id}</span>
          </div>

          {/* Header Title with tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => navigate('/supervisor/assigned')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={styles.pageTitle}>{paper.title}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#f0fdf4', color: '#047857', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  Publication ID: {paper.formattedPublicationId || `PUB-${paper.id}`}
                </span>
                <span style={{ backgroundColor: '#f0fdf4', color: '#047857', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {paper.category || 'General'}
                </span>
                <span style={{ backgroundColor: '#f0fdf4', color: '#047857', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {paper.subcategory || 'General'}
                </span>
              </div>
            </div>
          </div>

          {/* Left Column (Details & Form) and Right Column (History) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Submission Details Card */}
              <div className={styles.card} style={{ position: 'relative', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe',
                      display: 'inline-flex',
                      alignItems: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      SUBMITTED AT : {formatFullDateTime(paper.submittedAt)}
                    </span>
                    {paper.supervisorAssignedAt && (
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        display: 'inline-flex',
                        alignItems: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        ASSIGNED AT : {formatFullDateTime(paper.supervisorAssignedAt)}
                      </span>
                    )}
                  </div>
                  <div>
                    {getTopRightStatusBadge()}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Submission Details</h3>

                {paper.abstractText && paper.abstractText.trim() !== '' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Abstract</h3>
                    <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{paper.abstractText}</p>
                  </div>
                )}

                {paper.researchGap && paper.researchGap.trim() !== '' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Research Gap Found</h3>
                    <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{paper.researchGap}</p>
                  </div>
                )}

                {paper.keywords && paper.keywords.trim() !== '' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Keywords</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {paper.keywords.split(',').map((kw) => {
                        const trimmed = kw.trim();
                        return trimmed && (
                          <span key={trimmed} style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 500 }}>
                            {trimmed}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {paper.comments && paper.comments.trim() !== '' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Comment from Author</h3>
                    <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{paper.comments}</p>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', alignItems: 'end' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Author</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '0.1rem 0 0 0' }}>{paper.studentName}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>University</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '0.1rem 0 0 0' }}>{paper.studentUniversity || 'University of Ruhuna'}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Author Email</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '0.1rem 0 0 0' }}>{paper.studentEmail}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #0f172a',
                        color: '#0f172a',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                      onClick={handleOpenPdf}
                    >
                      <ExternalLink size={14} /> Preview PDF
                    </button>
                    <button 
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#0f172a',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                      onClick={handleDownload}
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Your decision */}
              <div className={styles.card}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginBottom: '1.5rem' }}>Your Decision</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Research direction</label>
                    <textarea
                      rows={3}
                      className={styles.searchInput}
                      placeholder="Advice the student on where to take this next."
                      value={researchDirection}
                      onChange={(e) => setResearchDirection(e.target.value)}
                      disabled={isApproved || isRejected}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', width: '100%', resize: 'none', background: (isApproved || isRejected) ? '#f1f5f9' : '#ffffff', cursor: (isApproved || isRejected) ? 'not-allowed' : 'text' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Research gap feedback</label>
                    <textarea
                      rows={3}
                      className={styles.searchInput}
                      placeholder="Comment on the identified research gap."
                      value={researchGapFeedback}
                      onChange={(e) => setResearchGapFeedback(e.target.value)}
                      disabled={isApproved || isRejected}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', width: '100%', resize: 'none', background: (isApproved || isRejected) ? '#f1f5f9' : '#ffffff', cursor: (isApproved || isRejected) ? 'not-allowed' : 'text' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Missing findings</label>
                    <textarea
                      rows={3}
                      className={styles.searchInput}
                      placeholder="Point out anything missing from the paper's evaluation."
                      value={missingFindings}
                      onChange={(e) => setMissingFindings(e.target.value)}
                      disabled={isApproved || isRejected}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', width: '100%', resize: 'none', background: (isApproved || isRejected) ? '#f1f5f9' : '#ffffff', cursor: (isApproved || isRejected) ? 'not-allowed' : 'text' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Comments</label>
                    <textarea
                      rows={3}
                      className={styles.searchInput}
                      placeholder="Overall comments and suggestions."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      disabled={isApproved || isRejected}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', width: '100%', resize: 'none', background: (isApproved || isRejected) ? '#f1f5f9' : '#ffffff', cursor: (isApproved || isRejected) ? 'not-allowed' : 'text' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Satisfaction level: {satisfactionLevel} / 5
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={satisfactionLevel}
                      onChange={(e) => setSatisfactionLevel(parseInt(e.target.value, 10))}
                      disabled={isApproved || isRejected}
                      style={{ width: '100%', accentColor: '#10b981', cursor: (isApproved || isRejected) ? 'not-allowed' : 'pointer' }}
                    />
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleAction('REJECTED')}
                      disabled={isApproved || isRejected}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1.25rem',
                        fontWeight: 600,
                        cursor: (isApproved || isRejected) ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        opacity: (isApproved || isRejected) ? 0.5 : 1
                      }}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('APPROVED')}
                      disabled={isApproved || isRejected}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1.25rem',
                        fontWeight: 600,
                        cursor: (isApproved || isRejected) ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        opacity: (isApproved || isRejected) ? 0.5 : 1
                      }}
                    >
                      Approve
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Review History */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Review History</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '2.5rem' }}>
                {/* Main vertical connector line */}
                <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>
                
                {/* 1. Submitted */}
                {(() => {
                  const active = !!paper.submittedAt;
                  return (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <div style={{ 
                        position: 'absolute', left: '-37px', top: '12px', width: '24px', height: '24px', borderRadius: '50%', 
                        backgroundColor: active ? '#2563eb' : '#ffffff', border: '2px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#ffffff' : '#2563eb', zIndex: 1 
                      }}>
                        {active ? <Check size={14} /> : <Clock size={14} />}
                      </div>
                      
                      <div style={{ 
                        backgroundColor: active ? '#ffffff' : '#f8fafc', 
                        border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`, 
                        borderLeft: `4px solid ${active ? '#2563eb' : '#cbd5e1'}`, 
                        borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                        position: 'relative'
                      }}>
                        {active && paper.submittedAt && (
                          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                            At {new Date(paper.submittedAt).toLocaleString('en-GB')}
                          </span>
                        )}
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: active ? '#1e40af' : '#64748b', margin: 0 }}>Submitted</h4>
                        {active ? (
                          <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.1rem 0 0 0' }}>
                            By {paper.studentName}
                          </p>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Pending submission</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Administrator Validation */}
                {(() => {
                  const active = !!paper.submittedAt;
                  return (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <div style={{ 
                        position: 'absolute', left: '-37px', top: '12px', width: '24px', height: '24px', borderRadius: '50%', 
                        backgroundColor: active ? '#ca8a04' : '#ffffff', border: '2px solid #ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#ffffff' : '#ca8a04', zIndex: 1 
                      }}>
                        {active ? <Check size={14} /> : <Clock size={14} />}
                      </div>
                      
                      <div style={{ 
                        backgroundColor: active ? '#ffffff' : '#f8fafc', 
                        border: `1px solid ${active ? '#ca8a04' : '#e2e8f0'}`, 
                        borderLeft: `4px solid ${active ? '#ca8a04' : '#cbd5e1'}`, 
                        borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                      }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: active ? '#854d0e' : '#64748b', margin: 0 }}>Administrator Validation</h4>
                        {active ? (
                          <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.1rem 0 0 0' }}>
                            By Repository Administrator
                          </p>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Pending validation</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2.1 Duplicate Check (Sub-section) */}
                {(() => {
                  const active = !!paper.duplicateCheckedAt;
                  const isDuplicate = paper.adminApprovalStatus === 'DUPLICATE DETECTED';
                  return (
                    <div style={{ position: 'relative', width: 'calc(100% - 2rem)', marginLeft: '2rem' }}>
                      <div style={{ position: 'absolute', left: '-2rem', top: '22px', width: '2rem', height: '2px', backgroundColor: active ? '#ca8a04' : '#e2e8f0', zIndex: 0 }}></div>
                      
                      <div style={{ 
                        position: 'absolute', left: '-10px', top: '12px', width: '20px', height: '20px', borderRadius: '50%', 
                        backgroundColor: active ? '#ca8a04' : '#ffffff', border: '2px solid #ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#ffffff' : '#ca8a04', zIndex: 1 
                      }}>
                        {active ? <Check size={12} /> : <Clock size={12} />}
                      </div>
                      
                      <div style={{ 
                        backgroundColor: active ? '#ffffff' : '#f8fafc', 
                        border: `1px solid ${active ? '#ca8a04' : '#e2e8f0'}`, 
                        borderLeft: `4px solid ${active ? '#ca8a04' : '#cbd5e1'}`, 
                        borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                        position: 'relative'
                      }}>
                        {active && paper.duplicateCheckedAt && (
                          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#fef3c7', color: '#78350f', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, border: '1px solid #fde68a' }}>
                            At {new Date(paper.duplicateCheckedAt).toLocaleString('en-GB')}
                          </span>
                        )}
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: active ? '#854d0e' : '#64748b', margin: 0 }}>Duplicate Check</h4>
                        {active ? (
                          <span style={{
                            alignSelf: 'flex-start',
                            marginTop: '0.25rem',
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            borderRadius: '4px',
                            backgroundColor: isDuplicate ? '#fee2e2' : '#d1fae5',
                            color: isDuplicate ? '#991b1b' : '#065f46'
                          }}>
                            {isDuplicate ? 'Refuse / Duplicate Detected' : 'Verified / No Duplicate Found'}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>Pending Duplicate Check</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2.2 Supervisor Assigned (Sub-section) */}
                {(() => {
                  const isAssigned = !!paper.supervisorAssignedAt;
                  const active = isAssigned;
                  const hasSubmission = !!paper.submittedAt;
                  
                  return (
                    <div style={{ position: 'relative', width: 'calc(100% - 2rem)', marginLeft: '2rem' }}>
                      <div style={{ position: 'absolute', left: '-2rem', top: '22px', width: '2rem', height: '2px', backgroundColor: active ? '#ca8a04' : '#e2e8f0', zIndex: 0 }}></div>
                      
                      <div style={{ 
                        position: 'absolute', left: '-10px', top: '12px', width: '20px', height: '20px', borderRadius: '50%', 
                        backgroundColor: isAssigned ? '#ca8a04' : '#ffffff', border: '2px solid #ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isAssigned ? '#ffffff' : '#ca8a04', zIndex: 1 
                      }}>
                        {isAssigned ? <Check size={12} /> : <Clock size={12} />}
                      </div>
                      
                      <div style={{ 
                        backgroundColor: active ? '#ffffff' : '#f8fafc', 
                        border: `1px solid ${active ? '#ca8a04' : '#e2e8f0'}`, 
                        borderLeft: `4px solid ${isAssigned ? '#ca8a04' : '#cbd5e1'}`, 
                        borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                        position: 'relative'
                      }}>
                        {isAssigned && paper.supervisorAssignedAt && (
                          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#fef3c7', color: '#78350f', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, border: '1px solid #fde68a' }}>
                            At {new Date(paper.supervisorAssignedAt).toLocaleString('en-GB')}
                          </span>
                        )}
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: active ? '#854d0e' : '#64748b', margin: 0 }}>Supervisor Assigned</h4>
                        {hasSubmission ? (
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div>
                              <strong>Assigned Supervisor:</strong>{' '}
                              <span style={{ fontWeight: 600 }}>
                                {getSupervisorNameByEmail(paper.assignedSupervisorEmail)}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#475569', margin: '0.1rem 0 0 0' }}>
                              By Repository Administrator
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>Pending Assignment</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Under Supervisor Review */}
                {(() => {
                  const active = !!paper.supervisorAssignedAt;
                  return (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <div style={{ 
                        position: 'absolute', left: '-37px', top: '12px', width: '24px', height: '24px', borderRadius: '50%', 
                        backgroundColor: active ? '#10b981' : '#ffffff', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#ffffff' : '#10b981', zIndex: 1 
                      }}>
                        {active ? <Check size={14} /> : <Clock size={14} />}
                      </div>
                      
                      <div style={{ 
                        backgroundColor: active ? '#ffffff' : '#f8fafc', 
                        border: `1px solid ${active ? '#10b981' : '#e2e8f0'}`, 
                        borderLeft: `4px solid ${active ? '#10b981' : '#cbd5e1'}`, 
                        borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                      }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: active ? '#047857' : '#64748b', margin: 0 }}>Under Supervisor Review</h4>
                        {active ? (
                          <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.1rem 0 0 0' }}>
                            By {paper.supervisorName || getSupervisorNameByEmail(paper.assignedSupervisorEmail)}
                          </p>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Pending Review</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3.1 Supervisor Decision (Sub-section) */}
                {(() => {
                  const isAssigned = !!paper.supervisorAssignedAt;
                  const active = isAssigned && (paper.status === 'APPROVED' || paper.status === 'REJECTED');
                  const approvalStatus = paper.status;
                  
                  const getDecisionBadge = () => {
                    if (approvalStatus === 'APPROVED') {
                      return { text: 'Approved', bg: '#d1fae5', color: '#065f46' };
                    }
                    if (approvalStatus === 'REJECTED') {
                      return { text: 'REJECTED', bg: '#fee2e2', color: '#991b1b' };
                    }
                    return { text: 'UNDER REVIEW', bg: '#dbeafe', color: '#1e40af' };
                  };
                  
                  const badge = getDecisionBadge();

                  return (
                    <div style={{ position: 'relative', width: 'calc(100% - 2rem)', marginLeft: '2rem' }}>
                      <div style={{ position: 'absolute', left: '-2rem', top: '22px', width: '2rem', height: '2px', backgroundColor: isAssigned ? '#10b981' : '#e2e8f0', zIndex: 0 }}></div>
                      
                      <div style={{ 
                        position: 'absolute', left: '-10px', top: '12px', width: '20px', height: '20px', borderRadius: '50%', 
                        backgroundColor: active ? '#10b981' : '#ffffff', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#ffffff' : '#10b981', zIndex: 1 
                      }}>
                        {active ? <Check size={12} /> : <Clock size={12} />}
                      </div>
                      
                      <div style={{ 
                        backgroundColor: isAssigned ? '#ffffff' : '#f8fafc', 
                        border: `1px solid ${isAssigned ? '#10b981' : '#e2e8f0'}`, 
                        borderLeft: `4px solid ${active ? '#10b981' : '#cbd5e1'}`, 
                        borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                        boxShadow: isAssigned ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                        position: 'relative'
                      }}>
                        {active && paper.supervisorDesignedAt && (
                          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#f0fdf4', color: '#047857', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                            At {new Date(paper.supervisorDesignedAt).toLocaleString('en-GB')}
                          </span>
                        )}
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: isAssigned ? '#047857' : '#64748b', margin: 0 }}>Supervisor Decision</h4>
                        {isAssigned ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {active ? (
                              <>
                                <span style={{
                                  alignSelf: 'flex-start',
                                  padding: '0.15rem 0.5rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  borderRadius: '4px',
                                  backgroundColor: approvalStatus === 'APPROVED' ? '#d1fae5' : '#fee2e2',
                                  color: approvalStatus === 'APPROVED' ? '#065f46' : '#991b1b'
                                }}>
                                  {approvalStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                                  By {paper.supervisorName || getSupervisorNameByEmail(paper.assignedSupervisorEmail)}
                                </span>
                              </>
                            ) : (
                              <span style={{
                                alignSelf: 'flex-start',
                                padding: '0.15rem 0.5rem',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                borderRadius: '4px',
                                backgroundColor: '#dbeafe',
                                color: '#1e40af'
                              }}>
                                UNDER REVIEW
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>Pending Decision</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Published */}
                {(() => {
                  const active = paper.status === 'PUBLISHED' || paper.isPublished;
                  return (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <div style={{ 
                        position: 'absolute', left: '-37px', top: '12px', width: '24px', height: '24px', borderRadius: '50%', 
                        backgroundColor: active ? '#2563eb' : '#ffffff', border: '2px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#ffffff' : '#2563eb', zIndex: 1 
                      }}>
                        {active ? <Check size={14} /> : <Clock size={14} />}
                      </div>
                      
                      <div style={{ 
                        backgroundColor: active ? '#ffffff' : '#f8fafc', 
                        border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`, 
                        borderLeft: `4px solid ${active ? '#2563eb' : '#cbd5e1'}`, 
                        borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                        position: 'relative'
                      }}>
                        {active && paper.publishedAt && (
                          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', backgroundColor: '#eff6ff', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                            At {new Date(paper.publishedAt).toLocaleString('en-GB')}
                          </span>
                        )}
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: active ? '#1e40af' : '#64748b', margin: 0 }}>Published</h4>
                        {active ? (
                          <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.1rem 0 0 0' }}>
                            By {paper.studentName}
                          </p>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Pending Publication</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Supervisor Decision Confirmation Blur Modal */}
      {showConfirmPopup && pendingDecision && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', width: '95%', maxWidth: '450px', position: 'relative' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Confirm Review Decision</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              You are locking your review decision for this paper as <strong>{pendingDecision === 'APPROVED' ? 'APPROVED' : 'REJECTED'}</strong>.
              An email and dashboard notification will be sent immediately to the student.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowConfirmPopup(false);
                  setPendingDecision(null);
                }}
                style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back to Decision
              </button>
              <button
                onClick={handleConfirmDecision}
                style={{ padding: '0.5rem 1.25rem', border: 'none', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPaperDummy;
