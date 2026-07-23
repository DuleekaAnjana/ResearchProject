import { useState, useRef } from 'react';
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
  const [supervisorEmail, setSupervisorEmail] = useState('demo@researchsphere.edu');
  const [comments, setComments] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [pages, setPages] = useState('');

  // ---- Feedback/UI State ----
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ---- Derived category sub-options ----
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
    if (statusType === 'PENDING' && !keywords.trim()) {
      setErrorMsg('Keywords are required for submitting for review.');
      return;
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
                  onClick={() => navigate('/student/dashboard')}
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

                {/* Keywords */}
                <div className={styles.formField}>
                  <label htmlFor="submission-keywords" className={styles.label}>
                    Keywords (comma separated) <span className={styles.labelRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    id="submission-keywords"
                    className={styles.input}
                    placeholder="e.g., deep learning, healthcare, imaging"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    required
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
                      {`You're in ${studentCategory}. Select subcategory related to this submission`}
                    </option>
                    {subcategoryOptions.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requested Supervisor */}
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label htmlFor="submission-supervisor" className={styles.label}>
                    Requested Supervisor <span className={styles.labelRequired}>*</span>
                  </label>
                  <select
                    id="submission-supervisor"
                    className={styles.select}
                    value={supervisorEmail}
                    onChange={(e) => setSupervisorEmail(e.target.value)}
                  >
                    <option value="demo@researchsphere.edu">
                      Prof. Ranjith Silva — University of Colombo
                    </option>
                    <option value="supervisor@researchsphere.edu">
                      Prof. B. Perera — University of Colombo
                    </option>
                  </select>
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
                  onClick={() => navigate('/student/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.saveDraftBtn}
                  onClick={() => handleSave('DRAFT')}
                  disabled={loading}
                >
                  Save draft
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
    </div>
  );
};

export default NewSubmissionPage;
