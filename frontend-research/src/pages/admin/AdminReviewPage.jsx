import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Check, Clock, AlertCircle, FileText, Download, Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { API_BASE_URL } from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './ManageSubmissions.module.css';

const AdminReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState(null);
  const [supervisors, setSupervisors] = useState([]);

  // PDF Preview State
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(100);

  // Workflow State - Duplicate Check
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [originalityDecision, setOriginalityDecision] = useState(null); // 'VERIFIED' or 'DUPLICATE_DETECTED'
  const [tempDecision, setTempDecision] = useState(null);
  const [showOriginalityPopup, setShowOriginalityPopup] = useState(false);
  const [isOriginalityConfirmed, setIsOriginalityConfirmed] = useState(false);
  const [confirmDateText, setConfirmDateText] = useState('Not Verified Yet');
  const [showConfirmOriginalityPopup, setShowConfirmOriginalityPopup] = useState(false);
  
  // Highlight preview/download buttons state
  const [highlightButtons, setHighlightButtons] = useState(false);

  // Workflow State - Assign Supervisor
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showAssignPopup, setShowAssignPopup] = useState(false);

  // Supervisor assignment UI preview states
  const [tempSupervisorEmail, setTempSupervisorEmail] = useState(null);
  const [tempSupervisorName, setTempSupervisorName] = useState(null);
  const [tempSupervisorDateText, setTempSupervisorDateText] = useState(null);

  // Ref for scrolling to download/preview buttons
  const buttonsRef = useRef(null);

  const getNumericId = (pubId) => {
    if (!pubId) return 1;
    const clean = pubId.toLowerCase().replace('pub-', '');
    const num = parseInt(clean, 10);
    return isNaN(num) ? 1 : num;
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const numericId = getNumericId(id);
      const data = await api.get(`/papers/${numericId}`);
      if (data) {
        setPaper(data);
        
        // Initialize states based on DB data
        const isOriginalityDone = data.duplicateCheckedAt !== null || data.adminApprovalStatus === 'DUPLICATE DETECTED' || data.adminApprovalStatus === 'VERIFIED';
        setIsDuplicateChecked(isOriginalityDone);
        setIsOriginalityConfirmed(isOriginalityDone);
        let decision = data.adminApprovalStatus;
        if (data.duplicateCheckedAt && (data.adminApprovalStatus === 'PENDING' || data.adminApprovalStatus === 'VERIFIED')) {
          decision = 'VERIFIED';
        }
        setOriginalityDecision(isOriginalityDone ? decision : null);
        
        if (data.duplicateCheckedAt) {
          const date = new Date(data.duplicateCheckedAt);
          const pad = (n) => n.toString().padStart(2, '0');
          setConfirmDateText(`Completed at ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`);
        } else if (isDup) {
          setConfirmDateText(`Completed at 27/07/2026 23:54`); // Seed placeholder default
        } else {
          setConfirmDateText('Not Verified Yet');
        }
      }
      
      const supsData = await api.get('/admin/supervisors');
      if (supsData) {
        setSupervisors(supsData);
      }
    } catch (err) {
      console.error('Failed to load paper details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCheckDuplicate = () => {
    setHighlightButtons(true);
    if (buttonsRef.current) {
      buttonsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightButtons(false);
    }, 3000);
  };

  const handleVerifyOriginalityClick = () => {
    if (isOriginalityConfirmed) return;
    setTempDecision(originalityDecision);
    setShowOriginalityPopup(true);
  };

  const handleSaveOriginalityOption = (option) => {
    setOriginalityDecision(option);
    setShowOriginalityPopup(false);
  };

  const handleConfirmOriginalityOption = () => {
    // Deprecated since selection immediately closes and saves option state.
  };

  const handleConfirmDuplicateWorkflow = async () => {
    if (!originalityDecision) return;
    try {
      const numericId = getNumericId(id);
      const res = await api.post(`/admin/papers/${numericId}/confirm-originality`, {
        decision: originalityDecision
      });
      if (res) {
        setPaper(res);
        setIsOriginalityConfirmed(true);
        setIsDuplicateChecked(true);
        if (res.duplicateCheckedAt) {
          const date = new Date(res.duplicateCheckedAt);
          const pad = (n) => n.toString().padStart(2, '0');
          const dateStr = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
          setConfirmDateText(`Completed at ${dateStr}`);
        }
        
        // Clear previews since they are now persisted in paper state
        setTempSupervisorEmail(null);
        setTempSupervisorName(null);
        setTempSupervisorDateText(null);
        fetchDetails();
        setTimeout(() => {
          const ws = document.getElementById('verification-workflow');
          if (ws) {
            ws.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    } catch (err) {
      console.error('Failed to confirm originality:', err);
      alert('Failed to save originality decision.');
    }
  };

  const handleSelectSupervisorChange = (e) => {
    const supEmail = e.target.value;
    if (supEmail === 'No Supervisor Available') {
      setSelectedSupervisor({ fullName: 'No Supervisor Available', email: 'No Supervisor Available' });
      setTempSupervisorEmail('No Supervisor Available');
      setTempSupervisorName('No Supervisor Available');
      setTempSupervisorDateText("Not Assigned Yet");
    } else {
      const sup = supervisors.find(s => s.email === supEmail);
      setSelectedSupervisor(sup || null);
      if (sup) {
        setTempSupervisorEmail(sup.email);
        setTempSupervisorName(sup.fullName);
        setTempSupervisorDateText("Not Assigned Yet");
      } else {
        setTempSupervisorEmail(null);
        setTempSupervisorName(null);
        setTempSupervisorDateText(null);
      }
    }
  };

  const handleAssignSupervisorClick = () => {
    if (!selectedSupervisor) return;
    setShowAssignPopup(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedSupervisor || !paper) return;
    try {
      const numericId = getNumericId(id);
      const res = await api.post(`/admin/papers/${numericId}/assign-supervisor`, {
        supervisorEmail: selectedSupervisor.email
      });
      if (res) {
        setPaper(res);
        setShowAssignPopup(false);
        setTempSupervisorEmail(null);
        setTempSupervisorName(null);
        setTempSupervisorDateText(null);
        fetchDetails();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to assign supervisor.');
    }
  };

  const handleCancelClickOnSupervisor = () => {
    // Warning alerts are removed as requested.
  };

  const handleDownload = async () => {
    if (!paper) return;
    try {
      const response = await fetch(`${API_BASE_URL}/papers/${getNumericId(id)}/pdf`);
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

  const getStatusBadgeStyle = (status) => {
    if (status === 'APPROVED' || status === 'VERIFIED') {
      return { backgroundColor: '#d1fae5', color: '#065f46' };
    }
    if (status === 'DUPLICATE DETECTED' || status === 'DUPLICATE_DETECTED') {
      return { backgroundColor: '#fee2e2', color: '#991b1b' };
    }
    if (status === 'SUPERVISOR NOT AVAILABLE' || status === 'SUPERVISOR_NOT_AVAILABLE') {
      return { backgroundColor: '#ffedd5', color: '#c2410c' };
    }
    return { backgroundColor: '#dbeafe', color: '#1e40af' };
  };

  const getStatusText = (status) => {
    if (status === 'APPROVED' || status === 'VERIFIED') return 'VERIFIED';
    if (status === 'DUPLICATE DETECTED' || status === 'DUPLICATE_DETECTED') return 'DUPLICATE DETECTED';
    if (status === 'SUPERVISOR NOT AVAILABLE' || status === 'SUPERVISOR_NOT_AVAILABLE') return 'SUPERVISOR NOT AVAILABLE';
    return 'UNDER ADMIN APPROVAL';
  };

  if (loading || !paper) {
    return (
      <div className={styles.dashboardLayout}>
        {sidebarOpen && <AdminSidebar />}
        <div className={styles.mainContent}>
          <DashboardHeader
            onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
            notificationsRoute="/admin/notifications"
          />
          <main className={styles.pageBody} style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Loading submission details...</div>
          </main>
        </div>
      </div>
    );
  }

  const submittedYear = paper.submittedAt ? new Date(paper.submittedAt).getFullYear() : 2026;

  // Timeline variables
  const isSubmitted = !!paper.submittedAt;
  const isAdminValidated = !!paper.adminValidatedAt || !!paper.duplicateCheckedAt;
  const isDuplicateCheckedStep = !!paper.duplicateCheckedAt;
  const isSupervisorAssigned = !!paper.supervisorAssignedAt;
  const isUnderReview = !!paper.underReviewAt;
  const isApproved = paper.status === 'APPROVED';
  const isPublished = paper.isPublished || paper.status === 'APPROVED';

  const getSupervisorNameByEmail = (email) => {
    if (!email) return 'None';
    const sup = supervisors.find(s => s.email === email);
    return sup ? sup.fullName : 'Prof. Ranjith Silva';
  };

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && <AdminSidebar />}

      <div className={styles.mainContent}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/admin/notifications"
        />

        <main className={styles.pageBody} style={{ padding: '2rem', paddingBottom: '4rem' }}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumb} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/admin/dashboard" className={styles.breadcrumbLink} style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>
            <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
            <Link to="/admin/submissions" className={styles.breadcrumbLink} style={{ textDecoration: 'none', color: '#64748b' }}>Publications</Link>
            <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{paper.formattedPublicationId || `Pub-0${paper.id}`}</span>
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => navigate('/admin/submissions')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{paper.title}</h1>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                {paper.category} &middot; {paper.subcategory || 'General'}
              </p>
            </div>
            
            {/* Download and Preview actions */}
            <div 
              ref={buttonsRef}
              style={{ 
                marginLeft: 'auto', 
                display: 'flex', 
                gap: '0.75rem', 
                padding: '0.5rem', 
                borderRadius: '8px',
                border: highlightButtons ? '3px solid #6366f1' : '1px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              <button
                onClick={() => setShowPdfPreview(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Eye size={16} />
                Preview PDF
              </button>
              <button
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#0f172a',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Abstract details card */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span 
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        ...getStatusBadgeStyle(paper.adminApprovalStatus || paper.status)
                      }}
                    >
                      {getStatusText(paper.adminApprovalStatus || paper.status)}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {submittedYear}
                    </span>
                  </div>
                </div>

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

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Submitted At</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '0.1rem 0 0 0' }}>
                      {paper.submittedAt ? new Date(paper.submittedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Workflow Card */}
              <div id="verification-workflow" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ca8a04', marginBottom: '1.5rem' }}>Verification Workflow</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Left: Duplicate/Plagiarism */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#fcfcfd' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>1. Duplicate / Plagiarism Check</h3>
                    
                    {!isOriginalityConfirmed ? (
                      <>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                          Not Verified Yet
                        </p>
                        {originalityDecision && (
                          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', fontStyle: 'italic' }}>
                            Selected: <span style={{ fontWeight: 600, color: originalityDecision === 'VERIFIED' ? '#16a34a' : '#dc2626' }}>
                              {originalityDecision === 'VERIFIED' ? 'Verified / No Duplicate Found' : 'Refuse / Duplicate Detected'}
                            </span>
                          </p>
                        )}
                      </>
                    ) : (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: originalityDecision === 'VERIFIED' ? '#16a34a' : '#dc2626', margin: 0 }}>
                          {originalityDecision === 'VERIFIED' ? 'Verified / No Duplicate Found' : 'Refuse / Duplicate Detected'}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: originalityDecision === 'VERIFIED' ? '#16a34a' : '#dc2626', margin: '0.2rem 0 0 0', fontWeight: 600 }}>
                          {confirmDateText}
                        </p>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <button
                        onClick={handleCheckDuplicate}
                        disabled={isOriginalityConfirmed}
                        style={{
                          flex: 1,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: isOriginalityConfirmed ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Check Duplicate
                      </button>
                      <button
                        onClick={handleVerifyOriginalityClick}
                        disabled={isOriginalityConfirmed}
                        style={{
                          flex: 1,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: isOriginalityConfirmed ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Verify Originality
                      </button>
                    </div>

                    <button
                      onClick={() => setShowConfirmOriginalityPopup(true)}
                      disabled={isOriginalityConfirmed || !originalityDecision}
                      style={{
                        width: '100%',
                        backgroundColor: (isOriginalityConfirmed || !originalityDecision) ? '#cbd5e1' : '#1e293b',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: (isOriginalityConfirmed || !originalityDecision) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Confirm Originality Check
                    </button>
                  </div>

                  {/* Right: Assign Supervisor */}
                  {(() => {
                    const isAssignSupervisorEnabled = isOriginalityConfirmed && originalityDecision === 'VERIFIED';
                    const isSupervisorAlreadyAssigned = !!paper.supervisorAssignedAt;
                    
                    const filteredSupervisors = supervisors.filter(
                      sup => sup.available && sup.researchCategory && sup.researchCategory.toLowerCase() === paper.category?.toLowerCase()
                    );

                    const getRequestedSupervisorDisplay = () => {
                      if (!paper.stuRequestedSupervisorEmail || paper.stuRequestedSupervisorEmail.trim() === '') {
                        return <span style={{ color: '#0f172a', fontWeight: 500 }}>Not Requested Specific Expert</span>;
                      }
                      const reqSup = supervisors.find(s => s.email === paper.stuRequestedSupervisorEmail);
                      if (reqSup) {
                        return (
                          <span>
                            {reqSup.fullName}<br />
                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{paper.stuRequestedSupervisorEmail}</span>
                          </span>
                        );
                      }
                      return paper.stuRequestedSupervisorEmail;
                    };

                    const renderAssignedSupervisorSection = () => {
                      if (paper.assignedSupervisorEmail && paper.supervisorAssignedAt) {
                        const isNoSup = paper.assignedSupervisorEmail === 'No Supervisor Available';
                        const isSame = !paper.stuRequestedSupervisorEmail || paper.stuRequestedSupervisorEmail.trim() === '' || paper.assignedSupervisorEmail === paper.stuRequestedSupervisorEmail;
                        const displayColor = isSame ? '#16a34a' : '#dc2626';
                        
                        const date = paper.supervisorAssignedAt ? new Date(paper.supervisorAssignedAt) : null;
                        const pad = (n) => n.toString().padStart(2, '0');
                        const dateStr = date 
                          ? `Completed at ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
                          : 'Completed at 23/07/2026 23:44';

                        return (
                          <span style={{ display: 'block', color: displayColor, marginTop: '0.25rem' }}>
                            <strong style={{ display: 'block' }}>
                              {isNoSup ? 'No Supervisor Available' : (paper.supervisorName || paper.assignedSupervisorEmail)}
                            </strong>
                            {!isNoSup && (
                              <span style={{ fontSize: '0.8rem', display: 'block' }}>
                                ({paper.assignedSupervisorEmail})
                              </span>
                            )}
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginTop: '0.1rem' }}>
                              {dateStr}
                            </span>
                          </span>
                        );
                      }

                      if (tempSupervisorEmail) {
                        const isNoSup = tempSupervisorEmail === 'No Supervisor Available';
                        const isSame = !paper.stuRequestedSupervisorEmail || paper.stuRequestedSupervisorEmail.trim() === '' || tempSupervisorEmail === paper.stuRequestedSupervisorEmail;
                        const displayColor = isSame ? '#16a34a' : '#dc2626';
                        
                        return (
                          <span style={{ display: 'block', marginTop: '0.25rem' }}>
                            <span style={{ display: 'block', color: '#0f172a', fontWeight: 500, fontSize: '0.85rem' }}>
                              Not Assigned Yet
                            </span>
                            <strong style={{ display: 'block', color: displayColor, marginTop: '0.1rem' }}>
                              {isNoSup ? 'No Supervisor Available' : tempSupervisorName}
                            </strong>
                          </span>
                        );
                      }

                      return (
                        <span style={{ display: 'block', color: '#0f172a', fontWeight: 500, marginTop: '0.25rem' }}>
                          Not Assigned Yet
                        </span>
                      );
                    };

                    const isSelectDisabled = !isAssignSupervisorEnabled || isSupervisorAlreadyAssigned;
                    const isButtonDisabled = !isAssignSupervisorEnabled || !selectedSupervisor || paper?.assignedSupervisorEmail === selectedSupervisor.email || isSupervisorAlreadyAssigned;

                    return (
                      <div 
                        style={{ 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '8px', 
                          padding: '1rem', 
                          backgroundColor: '#fcfcfd',
                          opacity: isAssignSupervisorEnabled ? 1 : 0.6,
                          cursor: isAssignSupervisorEnabled ? 'default' : 'not-allowed'
                        }}
                      >
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>2. Assign Supervisor</h3>
                        
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', marginBottom: '1rem' }}>
                          <p style={{ margin: '0 0 0.75rem 0' }}>
                            <strong>Requested:</strong><br />
                            {getRequestedSupervisorDisplay()}
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Assigned:</strong><br />
                            {renderAssignedSupervisorSection()}
                          </p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            Select Supervisor:
                          </label>
                          <select
                            onChange={handleSelectSupervisorChange}
                            value={tempSupervisorEmail || (paper.supervisorAssignedAt ? paper.assignedSupervisorEmail : "") || ""}
                            disabled={isSelectDisabled}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem',
                              cursor: !isSelectDisabled ? 'pointer' : 'not-allowed'
                            }}
                          >
                            <option value="">-- Choose Supervisor --</option>
                            {filteredSupervisors.map(sup => (
                              <option key={sup.id} value={sup.email}>
                                {sup.fullName}
                              </option>
                            ))}
                            <option value="No Supervisor Available">Not Available Supervisor</option>
                          </select>
                        </div>

                        <button
                          onClick={handleAssignSupervisorClick}
                          disabled={isButtonDisabled}
                          style={{
                            width: '100%',
                            backgroundColor: isButtonDisabled ? '#cbd5e1' : '#1e293b',
                            border: 'none',
                            color: '#ffffff',
                            padding: '0.6rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            cursor: isButtonDisabled ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Assign Supervisor
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Right Column (Timeline) */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Submission timeline</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                
                {/* 1. Submitted */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' 
                  }}>
                    <Check size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Submitted</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                      {paper.submittedAt ? new Date(paper.submittedAt).toLocaleString('en-GB') : 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Vertical line connecting Submitted to Administrator Validation */}
                <div style={{ marginLeft: '15px', borderLeft: '2px solid #2563eb', height: '1.5rem', margin: '-0.5rem 0' }}></div>

                {/* 2. Administrator Validation */}
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' 
                    }}>
                      <Check size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Administrator Validation</h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                        By Repository Administrator
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.1rem 0 0 0' }}>
                        {paper.submittedAt ? new Date(paper.submittedAt).toLocaleString('en-GB') : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Indented child steps for Administrator Validation */}
                  <div style={{ marginLeft: '15px', borderLeft: '2px solid #2563eb', paddingLeft: '1.5rem', marginTop: '0.75rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Duplicate Check */}
                    {(() => {
                      const isDupActive = !!paper.duplicateCheckedAt;
                      return (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
                          <div style={{
                            position: 'absolute', left: '-37px', top: '2px',
                            width: '24px', height: '24px', borderRadius: '50%',
                            backgroundColor: isDupActive ? '#2563eb' : '#ffffff',
                            border: isDupActive ? 'none' : '2px solid #cbd5e1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isDupActive ? '#ffffff' : '#cbd5e1', zIndex: 1
                          }}>
                            {isDupActive ? <Check size={12} /> : <Clock size={12} />}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Duplicate Check</h4>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                              {paper.duplicateCheckedAt ? new Date(paper.duplicateCheckedAt).toLocaleString('en-GB') : 'Pending'}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Supervisor Assigned */}
                    {(() => {
                      const isSupActive = !!paper.supervisorAssignedAt;
                      return (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
                          <div style={{
                            position: 'absolute', left: '-37px', top: '2px',
                            width: '24px', height: '24px', borderRadius: '50%',
                            backgroundColor: isSupActive ? '#2563eb' : '#ffffff',
                            border: isSupActive ? 'none' : '2px solid #cbd5e1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isSupActive ? '#ffffff' : '#cbd5e1', zIndex: 1
                          }}>
                            {isSupActive ? <Check size={12} /> : <Clock size={12} />}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Supervisor Assigned</h4>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                              {paper.supervisorAssignedAt ? new Date(paper.supervisorAssignedAt).toLocaleString('en-GB') : 'Pending'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0 0 0', lineHeight: '1.3' }}>
                              <strong>Requested:</strong> {paper.stuRequestedSupervisorEmail ? `${getSupervisorNameByEmail(paper.stuRequestedSupervisorEmail)} (${paper.stuRequestedSupervisorEmail})` : 'None'}
                            </p>
                            {paper.assignedSupervisorEmail && (
                              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0', lineHeight: '1.3' }}>
                                <strong>Assigned:</strong> {paper.assignedSupervisorEmail === 'No Supervisor Available' ? 'No Supervisor Available' : `${paper.supervisorName || getSupervisorNameByEmail(paper.assignedSupervisorEmail)} (${paper.assignedSupervisorEmail})`}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Vertical line connecting Administrator Validation to Under Supervisor Review */}
                {(() => {
                  const isLineActive = !!paper.supervisorAssignedAt;
                  return (
                    <div style={{ marginLeft: '15px', borderLeft: `2px solid ${isLineActive ? '#2563eb' : '#cbd5e1'}`, height: '1.5rem', margin: '-0.5rem 0' }}></div>
                  );
                })()}

                {/* 3. Under Supervisor Review */}
                {(() => {
                  const isReviewActive = !!paper.supervisorAssignedAt;
                  return (
                    <div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          backgroundColor: isReviewActive ? '#2563eb' : '#ffffff', 
                          border: isReviewActive ? 'none' : '2px solid #cbd5e1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          color: isReviewActive ? '#ffffff' : '#cbd5e1' 
                        }}>
                          {isReviewActive ? <Check size={16} /> : <Clock size={16} />}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Under Supervisor Review</h4>
                          {paper.assignedSupervisorEmail && paper.assignedSupervisorEmail !== 'No Supervisor Available' && (
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                              By {paper.supervisorName || getSupervisorNameByEmail(paper.assignedSupervisorEmail)}
                            </p>
                          )}
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                            {paper.underReviewAt || paper.supervisorAssignedAt ? new Date(paper.underReviewAt || paper.supervisorAssignedAt).toLocaleString('en-GB') : 'Pending'}
                          </p>
                        </div>
                      </div>

                      {/* Indented child steps for Under Supervisor Review */}
                      <div style={{ marginLeft: '15px', borderLeft: `2px solid ${paper.status === 'APPROVED' ? '#2563eb' : '#cbd5e1'}`, paddingLeft: '1.5rem', marginTop: '0.75rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        {/* Approved */}
                        {(() => {
                          const isApprovedActive = paper.status === 'APPROVED';
                          return (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative' }}>
                              <div style={{
                                position: 'absolute', left: '-37px', top: '2px',
                                width: '24px', height: '24px', borderRadius: '50%',
                                backgroundColor: isApprovedActive ? '#2563eb' : '#ffffff',
                                border: isApprovedActive ? 'none' : '2px solid #cbd5e1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isApprovedActive ? '#ffffff' : '#cbd5e1', zIndex: 1
                              }}>
                                {isApprovedActive ? <Check size={12} /> : <Clock size={12} />}
                              </div>
                              <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Approved</h4>
                                {isApprovedActive && (
                                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                                    By {paper.supervisorName || getSupervisorNameByEmail(paper.assignedSupervisorEmail)}
                                  </p>
                                )}
                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                                  {paper.adminReviewedAt ? new Date(paper.adminReviewedAt).toLocaleString('en-GB') : 'Pending'}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}

                {/* Vertical line connecting Under Supervisor Review to Published */}
                {(() => {
                  const isLineActive = paper.status === 'APPROVED' || paper.isPublished;
                  return (
                    <div style={{ marginLeft: '15px', borderLeft: `2px solid ${isLineActive ? '#2563eb' : '#cbd5e1'}`, height: '1.5rem', margin: '-0.5rem 0' }}></div>
                  );
                })()}

                {/* 4. Published */}
                {(() => {
                  const isPublishedActive = paper.status === 'APPROVED' || paper.isPublished;
                  return (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        backgroundColor: isPublishedActive ? '#2563eb' : '#ffffff', 
                        border: isPublishedActive ? 'none' : '2px solid #cbd5e1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: isPublishedActive ? '#ffffff' : '#cbd5e1' 
                      }}>
                        {isPublishedActive ? <Check size={16} /> : <Clock size={16} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>Published</h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                          By {paper.studentName}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                          {paper.publishedAt || (paper.status === 'APPROVED' ? paper.adminReviewedAt : null) ? new Date(paper.publishedAt || paper.adminReviewedAt).toLocaleString('en-GB') : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PDF Scrollable Preview Modal */}
      {showPdfPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', width: '95%', maxWidth: '1000px', height: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            {/* PDF Viewer Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                  {paper.pdfFileName || `${paper.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_manuscript.pdf`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={handleDownload}
                  title="Download PDF"
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => setShowPdfPreview(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Document Content Pane */}
            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#475569', position: 'relative' }}>
              <iframe
                src={`${API_BASE_URL}/papers/${getNumericId(id)}/pdf`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Preview"
              />
            </div>
            
            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '0.75rem 1.5rem', borderTop: '1px solid #334155', backgroundColor: '#0f172a' }}>
              <button 
                onClick={() => setShowPdfPreview(false)}
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.4rem 1.25rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Originality Blur Modal */}
      {showOriginalityPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', width: '90%', maxWidth: '380px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <button 
              onClick={() => setShowOriginalityPopup(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Verify Paper Originality</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Please review the plagiarism detection report and declare your decision on this submission.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <button
                onClick={() => handleSaveOriginalityOption('VERIFIED')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: tempDecision === 'VERIFIED' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  backgroundColor: tempDecision === 'VERIFIED' ? '#f0fdf4' : '#ffffff',
                  color: tempDecision === 'VERIFIED' ? '#15803d' : '#334155',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Verified / No Duplicate Found
              </button>
              <button
                onClick={() => handleSaveOriginalityOption('DUPLICATE DETECTED')}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: tempDecision === 'DUPLICATE DETECTED' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  backgroundColor: tempDecision === 'DUPLICATE DETECTED' ? '#fef2f2' : '#ffffff',
                  color: tempDecision === 'DUPLICATE DETECTED' ? '#b91c1c' : '#334155',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Refuse / Duplicate Detected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Originality Confirmation Blur Modal */}
      {showConfirmOriginalityPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', width: '95%', maxWidth: '450px', position: 'relative' }}>
            <button 
              onClick={() => setShowConfirmOriginalityPopup(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Confirm Originality Check</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              You are locking the originality decision for this paper as <strong>{originalityDecision === 'VERIFIED' ? 'Verified / No Duplicate Found' : 'Refuse / Duplicate Detected'}</strong>.
              An email and dashboard notification will be sent immediately.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmOriginalityPopup(false)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back
              </button>
              <button
                onClick={async () => {
                  await handleConfirmDuplicateWorkflow();
                  setShowConfirmOriginalityPopup(false);
                }}
                style={{ padding: '0.5rem 1.25rem', border: 'none', backgroundColor: '#1e293b', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Assignment Confirmation Blur Modal */}
      {showAssignPopup && selectedSupervisor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', width: '95%', maxWidth: '450px', position: 'relative' }}>
            <button 
              onClick={() => setShowAssignPopup(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Confirm Supervisor Assignment</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              You are assigning <strong>{selectedSupervisor.fullName}</strong> {selectedSupervisor.email !== 'No Supervisor Available' && `(${selectedSupervisor.email})`} as the supervisor for this research paper. An email and dashboard notification will be sent immediately.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAssignPopup(false)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back to Selection
              </button>
              <button
                onClick={handleConfirmAssignment}
                style={{ padding: '0.5rem 1.25rem', border: 'none', backgroundColor: '#1e293b', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
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

export default AdminReviewPage;
