import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import styles from './LegalPages.module.css';

const TermsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backBtn} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={16} />
            Back to registration
          </button>
          <div className={styles.titleBadge}>
            <FileText size={16} />
            <span>Legal Document</span>
          </div>
          <h1 className={styles.pageTitle}>Terms and Conditions</h1>
          <p className={styles.meta}>Effective Date: July 2026 | Version: 1.0</p>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.tocBox}>
            <h2 className={styles.tocTitle}>Table of Contents</h2>
            <ol className={styles.tocList}>
              <li><a href="#section-1">1. Introduction</a></li>
              <li><a href="#section-2">2. Definitions</a></li>
              <li><a href="#section-3">3. Acceptance of Terms & Eligibility</a></li>
              <li><a href="#section-4">4. User Registration and Accounts</a></li>
              <li><a href="#section-5">5. Roles and Responsibilities</a></li>
              <li><a href="#section-6">6. Research Publication Policy & Workflow</a></li>
              <li><a href="#section-7">7. Publication Status & Duplicate Research Policy</a></li>
              <li><a href="#section-8">8. Resubmission Policy</a></li>
              <li><a href="#section-9">9. Articles and Blogs</a></li>
              <li><a href="#section-10">10. Intellectual Property & Repository Access</a></li>
              <li><a href="#section-11">11. User Conduct & Notifications</a></li>
              <li><a href="#section-12">12. Account Security & Privacy</a></li>
              <li><a href="#section-13">13. System Availability & Suspension</a></li>
              <li><a href="#section-14">14. Account Deletion & Limitation of Liability</a></li>
              <li><a href="#section-15">15. Amendments & Governing Principles</a></li>
              <li><a href="#section-16">16. Contact Information</a></li>
            </ol>
          </div>

          <div className={styles.bodyContent}>
            <section id="section-1" className={styles.section}>
              <h2>1. Introduction</h2>
              <p>
                Welcome to ResearchSphere, a Student Research Publication Repository System designed to facilitate the submission, review, management, publication, and dissemination of academic research produced by students and supervised by academic staff.
              </p>
              <p>
                By creating an account, accessing, or using this platform, you agree to comply with these Terms and Conditions.
              </p>
            </section>

            <section id="section-2" className={styles.section}>
              <h2>2. Definitions</h2>
              <p>For the purposes of these Terms:</p>
              <ul>
                <li><strong>System:</strong> Refers to ResearchSphere.</li>
                <li><strong>User:</strong> Refers to any registered individual or person using the system.</li>
                <li><strong>Student:</strong> Refers to a registered student author who submits research publications.</li>
                <li><strong>Supervisor:</strong> Refers to an approved academic reviewer.</li>
              </ul>
            </section>

            <section id="section-3" className={styles.section}>
              <h2>3. Acceptance of Terms & User Eligibility</h2>
              <p>
                By creating an account or using the system, users acknowledge that they have read, understood, and agreed to these Terms and Conditions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
