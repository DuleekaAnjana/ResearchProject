import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Send, AlertCircle, FileText, Check, Clock } from 'lucide-react';
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

  // Form State
  const [researchDirection, setResearchDirection] = useState('');
  const [researchGapFeedback, setResearchGapFeedback] = useState('');
  const [missingFindings, setMissingFindings] = useState('');
  const [comments, setComments] = useState('');
  const [satisfactionLevel, setSatisfactionLevel] = useState(4);
  const [submitting, setSubmitting] = useState(false);

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
        const numericId = getNumericId(id);
        const data = await api.get(`/papers/${numericId}`);
        if (data) {
          setPaper(data);
          setResearchDirection(data.researchDirection || '');
          setResearchGapFeedback(data.researchGapFeedback || '');
          setMissingFindings(data.missingFindings || '');
          setComments(data.comments || '');
          setSatisfactionLevel(data.satisfactionLevel || 4);
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
          publishedAt: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaperDetails();
  }, [id, user]);

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

  const handleAction = async (actionType) => {
    if (submitting) return;

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

    setSubmitting(true);
    try {
      const payload = {
        status: actionType,
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
        alert(`Successfully ${actionType === 'APPROVED' ? 'approved' : 'rejected'} this research paper!`);
        navigate('/supervisor/assigned');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Update simulated locally.');
      // Local simulated update
      setPaper(prev => ({
        ...prev,
        status: actionType,
        researchDirection,
        researchGapFeedback,
        missingFindings,
        comments,
        satisfactionLevel,
        reviewedAt: new Date().toISOString()
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
              <p className={styles.pageSubtext} style={{ marginTop: '0.25rem' }}>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, marginRight: '0.5rem' }}>
                  {paper.category}
                </span>
                {paper.subcategory && (
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {paper.subcategory}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Left Column (Details & Form) and Right Column (History) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Manuscript Box */}
              <div className={styles.card} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}>Manuscript</h2>
                  
                  {/* Status Label + Assigned Time moved to top right corner next to title */}
                  <span 
                    className={`${styles.statusBadge} ${
                      isApproved ? styles.statusApproved : isRejected ? styles.statusRejected : styles.statusPending
                    }`}
                    style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {paper.status === 'PENDING' || paper.status === 'SUBMITTED' ? 'UNDER REVIEW' : paper.status}
                    {paper.supervisorAssignedAt && (
                      <span style={{ fontWeight: 400, opacity: 0.85, fontSize: '0.7rem', borderLeft: '1px solid currentColor', paddingLeft: '0.4rem', marginLeft: '0.2rem' }}>
                        Assigned: {formatDateTime(paper.supervisorAssignedAt).split(' - ')[0]}
                      </span>
                    )}
                  </span>
                </div>

                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '2.5rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                  <FileText size={40} style={{ color: '#94a3b8', marginBottom: '0.75rem', marginLeft: 'auto', marginRight: 'auto' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155', margin: '0 0 0.25rem 0' }}>
                    {paper.pdfFileName || 'manuscript.pdf'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                    {paper.pages || 15} pages &bull; PDF document format
                  </p>
                  <button 
                    type="button"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0.4rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      alert('Opening PDF viewer helper...');
                    }}
                  >
                    Open in new tab
                  </button>
                </div>
              </div>

              {/* Submission details */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>Submission details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Student</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', margin: '0.1rem 0 0 0' }}>
                      {paper.studentName} &mdash; University of Colombo
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Abstract</span>
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: '0.2rem 0 0 0' }}>
                      {paper.abstractText}
                    </p>
                  </div>

                  {paper.researchGap && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Research gap</span>
                      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: '0.2rem 0 0 0' }}>
                        {paper.researchGap}
                      </p>
                    </div>
                  )}

                  {paper.keywords && (
                    <div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        {paper.keywords.split(',').map((kw) => (
                          <span key={kw} style={{ backgroundColor: '#2563eb', color: '#ffffff', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Your decision */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>Your decision</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Research direction</label>
                    <textarea
                      rows={3}
                      className={styles.searchInput}
                      placeholder="Advice the student on where to take this next."
                      value={researchDirection}
                      onChange={(e) => setResearchDirection(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', width: '100%', resize: 'none', background: '#ffffff' }}
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
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', width: '100%', resize: 'none', background: '#ffffff' }}
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
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', width: '100%', resize: 'none', background: '#ffffff' }}
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
                      style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', width: '100%', resize: 'none', background: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Satisfaction level: {satisfactionLevel} / 5
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={satisfactionLevel}
                      onChange={(e) => setSatisfactionLevel(parseInt(e.target.value, 10))}
                      style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleAction('REJECTED')}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1.25rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('APPROVED')}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1.25rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Approve
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Review history */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle} style={{ marginBottom: '1.5rem' }}>Review history</h2>
              
              {/* Timeline Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #cbd5e1' }}>
                
                {/* 1. Submitted */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-2.15rem', top: '0.1rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '50%', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Check size={10} style={{ color: '#ffffff', strokeWidth: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Submitted</h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(paper.submittedAt)}</span>
                  </div>
                </div>

                {/* 2. Administrator Validation */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-2.15rem', top: '0.1rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '50%', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Check size={10} style={{ color: '#ffffff', strokeWidth: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Administrator Validation</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>By Repository Administrator</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(paper.adminValidatedAt)}</span>
                  </div>
                </div>

                {/* 3. Duplicate Check */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-2.15rem', top: '0.1rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '50%', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Check size={10} style={{ color: '#ffffff', strokeWidth: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Duplicate Check</h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(paper.duplicateCheckedAt)}</span>
                  </div>
                </div>

                {/* 4. Supervisor Assigned */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-2.15rem', top: '0.1rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '50%', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Check size={10} style={{ color: '#ffffff', strokeWidth: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Supervisor Assigned</h4>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(paper.supervisorAssignedAt)}</span>
                  </div>
                </div>

                {/* 5. Under Review */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-2.15rem', top: '0.1rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '50%', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Check size={10} style={{ color: '#ffffff', strokeWidth: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Under Review</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>By {supervisorDisplayName}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(paper.underReviewAt || paper.supervisorAssignedAt)}</span>
                  </div>
                </div>

                {/* 6. Approved */}
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: '-2.15rem', 
                    top: '0.1rem', 
                    backgroundColor: isApproved ? '#2563eb' : '#cbd5e1', 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    width: '1.25rem', 
                    height: '1.25rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {isApproved ? (
                      <Check size={10} style={{ color: '#ffffff', strokeWidth: 4 }} />
                    ) : (
                      <Clock size={10} style={{ color: '#ffffff' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', opacity: isApproved ? 1 : 0.55 }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                        {isRejected ? 'Rejected' : 'Approved'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>By {supervisorDisplayName}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(paper.reviewedAt)}</span>
                  </div>
                </div>

                {/* 7. Published */}
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: '-2.15rem', 
                    top: '0.1rem', 
                    backgroundColor: paper.status === 'PUBLISHED' ? '#2563eb' : '#cbd5e1', 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    width: '1.25rem', 
                    height: '1.25rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {paper.status === 'PUBLISHED' ? (
                      <Check size={10} style={{ color: '#ffffff', strokeWidth: 4 }} />
                    ) : (
                      <Clock size={10} style={{ color: '#ffffff' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', opacity: paper.status === 'PUBLISHED' ? 1 : 0.55 }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Published</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>By {paper.studentName}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDateTime(paper.publishedAt)}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ReviewPaperDummy;
