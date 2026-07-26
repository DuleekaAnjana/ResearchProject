import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  ChevronRight,
  ArrowLeft,
  Upload,
  CheckCircle,
  File,
  X,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StudentSidebar from '../../components/layout/StudentSidebar';
import StudentFooter from '../../components/layout/StudentFooter';
import styles from './NewSubmissionPage.module.css';
import dashboardStyles from './StudentDashboard.module.css';

/**
 * NewSubmissionPage – Student uploads a new research paper or saves it as a draft.
 * Conforms to requirements:
 * - Links to Student entity via foreign key.
 * - Research Category field is removed.
 * - Research Gap is optional and expanded (full width).
 * - Research Subcategory is optional with a customized placeholder mapping the student's category.
 * - Sends submissions to repository admin/supervisor review (status PENDING).
 */
const NewSubmissionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // ---- Form State ----
  const [title, setTitle] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [researchGap, setResearchGap] = useState('');
  const [keywords, setKeywords] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [comments, setComments] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [pages, setPages] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // ---- Feedback/UI State ----
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [supervisors, setSupervisors] = useState([]);

  // ---- Derived category sub-options ----
  const studentCategory = user?.researchCategory || 'Computer Science';

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const data = await api.get('/admin/supervisors');
        if (data) {
          setSupervisors(data);
          const filtered = data.filter(
            (sup) => sup.researchCategory && sup.researchCategory.toLowerCase() === studentCategory.toLowerCase()
          );
        }
      } catch (err) {
        console.error('Failed to fetch supervisors:', err);
      }
    };
    fetchSupervisors();
  }, [studentCategory]);

  const filteredSupervisors = supervisors.filter(
    (sup) => sup.researchCategory && sup.researchCategory.toLowerCase() === studentCategory.toLowerCase()
  );

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

  const subcategoryOptions = getSubcategories(studentCategory);

  // ---- Drag & Drop Handlers ----
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setErrorMsg('');
      } else {
        setErrorMsg('Only PDF files are supported.');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setErrorMsg('');
      } else {
        setErrorMsg('Only PDF files are supported.');
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const removeSelectedFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  // ---- Submit/Save logic ----
  const handleSave = async (statusType) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Title is required.');
      return;
    }
    if (!abstractText.trim()) {
      setErrorMsg('Abstract text is required.');
      return;
    }
    if (!pages || parseInt(pages, 10) <= 0) {
      setErrorMsg('Number of pages is required and must be greater than zero.');
      return;
    }

    let pdfBase64 = null;
    if (selectedFile) {
      pdfBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(selectedFile);
      });
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        abstractText: abstractText.trim(),
        researchGap: researchGap.trim(),
        keywords: keywords.trim(),
        subcategory: subcategory || null,
        supervisorEmail: supervisorEmail,
        studentEmail: user?.email || 'student@researchsphere.edu',
        comments: comments.trim(),
        pdfFileName: selectedFile ? selectedFile.name : 'manuscript.pdf',
        pdfBase64: pdfBase64,
        pages: pages ? parseInt(pages, 10) : null,
        status: statusType, // DRAFT or PENDING (for review)
      };

      await api.post('/papers', payload);
      
      setSuccessMsg(
        statusType === 'PENDING'
          ? 'Your manuscript has been submitted successfully for repository admin & supervisor review!'
          : 'Draft saved successfully.'
      );

      // Redirect after brief delay
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving the submission.');
    } finally {
      setLoading(false);
    }
  };
  const confirmLeave = () => {
    const isFormDirty = title.trim() || abstractText.trim() || researchGap.trim() || keywords.trim() || subcategory || comments.trim() || selectedFile;
    if (isFormDirty) {
      setShowLeaveModal(true);
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className={dashboardStyles.dashboardLayout}>
      {/* Sidebar */}
      {sidebarOpen && <StudentSidebar />}

      {/* Main */}
      <div className={dashboardStyles.mainContainer}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/student/notifications"
        />

        <div className={dashboardStyles.contentWrapper}>
          <div className={styles.pageContainer}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
              <Link to="/" className={styles.breadcrumbLink}>Home</Link>
              <ChevronRight size={14} />
              <Link to="/student/dashboard" className={styles.breadcrumbLink}>Student</Link>
              <ChevronRight size={14} />
              <span className={styles.breadcrumbCurrent}>New Submission</span>
            </div>

            {/* Header Section */}
            <div className={styles.headerSection}>
              <div className={styles.titleRow}>
                <button
                  className={styles.backBtn}
                  onClick={confirmLeave}
                  title="Back to Dashboard"
                >
                  <ArrowLeft size={16} />
                </button>
                <h1 className={styles.pageTitle}>New submission</h1>
              </div>
              <p className={styles.pageSubtitle}>
                Fill in your paper details and upload the manuscript. All fields marked required.
              </p>
            </div>

            {/* Notifications / Messages */}
            {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

            {/* Form */}
            <div className={styles.formCard}>
              <div className={styles.formGrid}>
                {/* Title */}
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label htmlFor="submission-title" className={styles.label}>
                    Title <span className={styles.labelRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    id="submission-title"
                    className={styles.input}
                    placeholder="A concise, descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Abstract */}
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label htmlFor="submission-abstract" className={styles.label}>
                    Abstract <span className={styles.labelRequired}>*</span>
                  </label>
                  <textarea
                    id="submission-abstract"
                    className={styles.textarea}
                    placeholder="Summarise the problem, method, and findings."
                    value={abstractText}
                    onChange={(e) => setAbstractText(e.target.value)}
                    required
                  />
                </div>

                {/* Research Gap (Expanded & Optional) */}
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label htmlFor="submission-researchgap" className={styles.label}>
                    Research gap found <span className={styles.labelOptional}>(Optional)</span>
                  </label>
                  <textarea
                    id="submission-researchgap"
                    className={`${styles.textarea} ${styles.researchGapTextarea}`}
                    placeholder="Explain the gap your paper addresses."
                    value={researchGap}
                    onChange={(e) => setResearchGap(e.target.value)}
                  />
                </div>

                {/* Subcategory (Optional, custom placeholder based on user's category) */}
                <div className={styles.formField}>
                  <label htmlFor="submission-subcategory" className={styles.label}>
                    Research Subcategory <span className={styles.labelOptional}>(Optional)</span>
                  </label>
                  <select
                    id="submission-subcategory"
                    className={styles.select}
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  >
                    <option value="">
                      {" --- Select subcategory relate Submission --- "}
                    </option>
                    {subcategoryOptions.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                    * Available selections are filtered according to your registered research category and specialization.
                  </span>
                </div>

                {/* Keywords (Optional) */}
                <div className={styles.formField}>
                  <label htmlFor="submission-keywords" className={styles.label}>
                    Keywords (Optional / Comma Separated) <span className={styles.labelOptional}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="submission-keywords"
                    className={styles.input}
                    placeholder="Say whatever inaddition choosen Subcategory"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                 {/* Requested Supervisor */}
                 <div className={`${styles.formField} ${styles.fullWidth}`}>
                   <label htmlFor="submission-supervisor" className={styles.label}>
                     Choose You Prefered Expert <span className={styles.labelOptional}>(Optional)</span>
                   </label>
                   <select
                     id="submission-supervisor"
                     className={styles.select}
                     value={supervisorEmail}
                     onChange={(e) => setSupervisorEmail(e.target.value)}
                   >
                     <option value="">Not Requested Specific Expert</option>
                     {filteredSupervisors.map((sup) => (
                       <option key={sup.id || sup.email} value={sup.email}>
                         {sup.fullName} — {sup.university || 'University of Colombo'}
                       </option>
                     ))}
                   </select>
                    <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block', lineHeight: '1.4' }}>
                      * Choose Preferred Expert
                      <br />
                      * Available selections are filtered according to your registered research category and specialization.
                    </span>
                 </div>

                {/* Additional comments */}
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label htmlFor="submission-comments" className={styles.label}>
                    Additional comments <span className={styles.labelOptional}>(Optional)</span>
                  </label>
                  <textarea
                    id="submission-comments"
                    className={styles.textarea}
                    placeholder="Anything the reviewer should know."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                {/* Number of Pages */}
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label htmlFor="submission-pages" className={styles.label}>
                    Number of Pages of Manuscript <span className={styles.labelRequired}>*</span>
                  </label>
                  <input
                    type="number"
                    id="submission-pages"
                    min="1"
                    className={styles.input}
                    placeholder="Enter the total number of pages"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    required
                  />
                </div>

                {/* PDF Manuscript Drag-and-drop Card */}
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label className={styles.label}>
                    PDF Manuscript <span className={styles.labelRequired}>*</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="application/pdf"
                    onChange={handleFileSelect}
                  />

                  <div
                    className={styles.uploadZone}
                    onClick={triggerFileSelect}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className={styles.fileSelectedBadge}>
                        <File size={16} />
                        <span>{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className={styles.uploadIcon} />
                        <span className={styles.uploadText}>
                          Drag & drop your PDF, or click to browse
                        </span>
                        <span className={styles.uploadSubtext}>
                          PDF only · max 20MB
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={confirmLeave}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={() => handleSave('PENDING')}
                  disabled={loading}
                >
                  Submit for review
                </button>
              </div>
            </div>
            <StudentFooter />
          </div>
        </div>
      </div>

      {showLeaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            border: '1px solid #e2e8f0',
          }}>
            {/* Close cross btn */}
            <button
              onClick={() => setShowLeaveModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                padding: '0.25rem',
              }}
              title="Close"
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              Unsaved Changes
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              You have unsaved changes in your submission form. Do you want to discard them or go back to finish the submission?
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  navigate('/student/dashboard');
                }}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #ef4444',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                Discard
              </button>
              <button
                onClick={() => setShowLeaveModal(false)}
                autoFocus
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '6px',
                  border: '1px solid #2563eb',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                Back to Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSubmissionPage;
