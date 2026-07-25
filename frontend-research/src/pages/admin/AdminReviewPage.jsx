import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Check, Clock, AlertCircle, FileText, Download, Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
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

  // Workflow State - Duplicate Check
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [originalityDecision, setOriginalityDecision] = useState(null); // 'VERIFIED' or 'DUPLICATE_DETECTED'
  const [tempDecision, setTempDecision] = useState(null);
  const [showOriginalityPopup, setShowOriginalityPopup] = useState(false);
  const [isOriginalityConfirmed, setIsOriginalityConfirmed] = useState(false);
  const [confirmDateText, setConfirmDateText] = useState('Not Verified Yet');
  
  // Highlight preview/download buttons state
  const [highlightButtons, setHighlightButtons] = useState(false);

  // Workflow State - Assign Supervisor
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showAssignPopup, setShowAssignPopup] = useState(false);

  // Password-guidance style alerts
  const [assignSupervisorAlert, setAssignSupervisorAlert] = useState('');

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
        const isDup = data.adminApprovalStatus === 'DUPLICATE DETECTED' || data.adminApprovalStatus === 'VERIFIED';
        setIsDuplicateChecked(isDup);
        setIsOriginalityConfirmed(isDup);
        setOriginalityDecision(data.adminApprovalStatus);
        
        if (data.duplicateCheckedAt) {
          const date = new Date(data.duplicateCheckedAt);
          setConfirmDateText(`Completed at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
        } else if (isDup) {
          setConfirmDateText(`Completed at Jul 27, 2026 23:54`); // Seed placeholder default
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
    setTempDecision(option);
  };

  const handleConfirmOriginalityOption = () => {
    if (!tempDecision) return;
    setOriginalityDecision(tempDecision);
    const date = new Date();
    setConfirmDateText(`Completed at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
    setShowOriginalityPopup(false);
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
          setConfirmDateText(`Completed at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
        }
        alert('Originality verification locked and submitted successfully!');
      }
    } catch (err) {
      console.error('Failed to confirm originality:', err);
      alert('Failed to save originality decision.');
    }
  };

  const handleSelectSupervisorChange = (e) => {
    const supEmail = e.target.value;
    const sup = supervisors.find(s => s.email === supEmail);
    setSelectedSupervisor(sup || null);
    setAssignSupervisorAlert('');
  };

  const handleAssignSupervisorClick = () => {
    if (originalityDecision === 'DUPLICATE DETECTED' || paper?.adminApprovalStatus === 'DUPLICATE DETECTED') {
      setAssignSupervisorAlert('you have already rejected since Detecting Duplicate. can not assign Supervisor');
      return;
    }
    if (!isOriginalityConfirmed) {
      setAssignSupervisorAlert('you have already rejected since Detecting Duplicate. can not assign Supervisor');
      return;
    }
    if (!selectedSupervisor) {
      setAssignSupervisorAlert('Assign Supervisor First');
      return;
    }
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
        alert('Supervisor assigned successfully!');
        fetchDetails();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to assign supervisor.');
    }
  };

  const handleCancelClickOnSupervisor = () => {
    if (originalityDecision === 'DUPLICATE DETECTED' || paper?.adminApprovalStatus === 'DUPLICATE DETECTED') {
      setAssignSupervisorAlert('you have already rejected since Detecting Duplicate. can not assign Supervisor');
    } else if (!isOriginalityConfirmed) {
      setAssignSupervisorAlert('you have already rejected since Detecting Duplicate. can not assign Supervisor');
    }
  };

  const handleDownload = () => {
    if (!paper) return;
    const docInfo = `
Title: ${paper.title}
Author: ${paper.studentName}
University: ${paper.studentUniversity || 'University of Colombo'}
Category: ${paper.category}
Subcategory: ${paper.subcategory || 'N/A'}
Abstract: ${paper.abstractText}
Research Gap: ${paper.researchGap || 'N/A'}
Keywords: ${paper.keywords}
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

  const submittedYear = paper.submittedAt ? new Date(paper.submittedAt).getFullYear() : 2026;

  // Timeline variables
  const isSubmitted = !!paper.submittedAt;
  const isAdminValidated = !!paper.adminValidatedAt || !!paper.duplicateCheckedAt;
  const isDuplicateCheckedStep = !!paper.duplicateCheckedAt;
  const isSupervisorAssigned = !!paper.supervisorAssignedAt;
  const isUnderReview = !!paper.underReviewAt;
  const isApproved = paper.status === 'APPROVED';
  const isPublished = paper.isPublished || paper.status === 'APPROVED';

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

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Abstract</h3>
                  <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{paper.abstractText}</p>
                </div>

                {paper.researchGap && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Research Gap Filled</h3>
                    <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>{paper.researchGap}</p>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Keywords</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {paper.keywords?.split(',').map((kw) => (
                      <span key={kw} style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 500 }}>
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>

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
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Requested Supervisor</span>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '0.1rem 0 0 0' }}>{paper.stuRequestedSupervisorEmail || paper.assignedSupervisorEmail}</p>
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
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', marginBottom: '1.5rem' }}>Verification Workflow</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Left: Duplicate/Plagiarism */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#fcfcfd' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>1. Duplicate / Plagiarism Check</h3>
                    <p style={{ fontSize: '0.85rem', color: isOriginalityConfirmed ? '#16a34a' : '#64748b', marginBottom: '1rem' }}>
                      {confirmDateText}
                    </p>
                    
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
                      onClick={handleConfirmDuplicateWorkflow}
                      disabled={isOriginalityConfirmed || !originalityDecision}
                      style={{
                        width: '100%',
                        backgroundColor: (isOriginalityConfirmed || !originalityDecision) ? '#cbd5e1' : '#2563eb',
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
                  <div 
                    onClick={handleCancelClickOnSupervisor}
                    style={{ 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px', 
                      padding: '1rem', 
                      backgroundColor: '#fcfcfd',
                      opacity: isOriginalityConfirmed ? 1 : 0.6,
                      cursor: isOriginalityConfirmed ? 'default' : 'not-allowed'
                    }}
                  >
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>2. Assign Supervisor</h3>
                    
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', marginBottom: '1rem' }}>
                      <strong>Requested:</strong> {paper.stuRequestedSupervisorEmail}<br/>
                      {paper.assignedSupervisorEmail ? (
                        <span style={{ color: '#16a34a' }}>
                          <strong>Assigned:</strong> {paper.supervisorName} ({paper.assignedSupervisorEmail})
                        </span>
                      ) : (
                        <span style={{ color: '#c2410c' }}>No Supervisor Assigned Yet</span>
                      )}
                    </p>

                    {/* Alert message display inside layout */}
                    {assignSupervisorAlert && (
                      <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                        {assignSupervisorAlert}
                      </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Select Supervisor:
                      </label>
                      <select
                        onChange={handleSelectSupervisorChange}
                        disabled={!isOriginalityConfirmed || originalityDecision === 'DUPLICATE DETECTED'}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="">-- Choose Supervisor --</option>
                        {supervisors.map(sup => (
                          <option key={sup.id} value={sup.email} disabled={!sup.available}>
                            {sup.fullName} ({sup.available ? "Available" : "Unavailable"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleAssignSupervisorClick}
                      disabled={!isOriginalityConfirmed || originalityDecision === 'DUPLICATE DETECTED'}
                      style={{
                        width: '100%',
                        backgroundColor: (!isOriginalityConfirmed || originalityDecision === 'DUPLICATE DETECTED') ? '#cbd5e1' : '#1e293b',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: (!isOriginalityConfirmed || originalityDecision === 'DUPLICATE DETECTED') ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Assign Supervisor
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Timeline) */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Submission timeline</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>
                
                {[
                  { label: 'Submitted', date: paper.submittedAt, active: isSubmitted },
                  { label: 'Administrator Validation', date: paper.adminValidatedAt || paper.duplicateCheckedAt, active: isAdminValidated },
                  { label: 'Duplicate Check', date: paper.duplicateCheckedAt, active: isDuplicateCheckedStep },
                  { label: 'Supervisor Assigned', date: paper.supervisorAssignedAt, active: isSupervisorAssigned },
                  { label: 'Under Review', date: paper.underReviewAt, active: isUnderReview },
                  { label: 'Approved', date: paper.adminReviewedAt, active: isApproved },
                  { label: 'Published', date: paper.publishedAt, active: isPublished }
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', zIndex: 1, alignItems: 'flex-start' }}>
                    <div 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: step.active ? '#2563eb' : '#ffffff', 
                        border: step.active ? 'none' : '2px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: step.active ? '#ffffff' : '#cbd5e1'
                      }}
                    >
                      {step.active ? <Check size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{step.label}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.1rem 0 0 0' }}>
                        {step.date ? new Date(step.date).toLocaleString('en-GB') : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PDF Scrollable Preview Modal */}
      {showPdfPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <button 
              onClick={() => setShowPdfPreview(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}
            >
              <X size={24} />
            </button>
            <h3 style={{ margin: '0 0 1rem 0' }}>PDF Manuscript Preview</h3>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '1.5rem', backgroundColor: '#f8fafc', whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <strong>Title:</strong> {paper.title}
              <br/><br/>
              <strong>Abstract:</strong> {paper.abstractText}
              <br/><br/>
              <strong>Research Gap:</strong> {paper.researchGap || 'Not Specified'}
              <br/><br/>
              <strong>Keywords:</strong> {paper.keywords}
              <br/><br/>
              <strong>Author:</strong> {paper.studentName} ({paper.studentEmail})
              <br/><br/>
              <strong>University:</strong> {paper.studentUniversity || 'University of Ruhuna'}
              <br/><br/>
              <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#64748b' }}>[Simulated PDF Document Content Viewer]</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  const docInfo = `Title: ${paper.title}\nAuthor: ${paper.studentName}`;
                  const blob = new Blob([docInfo], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }}
                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Open in New Tab
              </button>
              <button 
                onClick={() => setShowPdfPreview(false)}
                style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
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
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', width: '95%', maxWidth: '450px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <button 
              onClick={() => setShowOriginalityPopup(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
            >
              <X size={20} />
            </button>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Verify Paper Originality</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Please review the plagiarism detection report and declare your decision on this submission.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
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

            <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setShowOriginalityPopup(false)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back to Selection
              </button>
              <button
                onClick={handleConfirmOriginalityOption}
                disabled={!tempDecision}
                style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Save Option
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
              You are assigning <strong>{selectedSupervisor.fullName}</strong> ({selectedSupervisor.email}) as the supervisor for this research paper. An email and dashboard notification will be sent immediately.
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
