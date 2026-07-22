import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import styles from './LegalPages.module.css';

const TermsPage = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
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
                Welcome to ResearchSphere, a Student Research Publication Repository System designed to facilitate the submission, review, management, publication, and dissemination of academic research produced by students and supervised by academic staff. The platform provides role-based access for students, supervisors, user administrators, repository administrators, and super administrators.
              </p>
              <p>
                By creating an account, accessing, or using this platform, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of the system immediately.
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
                <li><strong>User Administrator:</strong> Refers to the administrator responsible for user management.</li>
                <li><strong>Repository Administrator:</strong> Refers to the administrator responsible for publication and repository management.</li>
                <li><strong>Super Administrator:</strong> Refers to the administrator with complete system privileges.</li>
                <li><strong>Publication:</strong> Includes research papers, articles, blogs, and any academic documents submitted through the system.</li>
              </ul>
            </section>

            <section id="section-3" className={styles.section}>
              <h2>3. Acceptance of Terms & User Eligibility</h2>
              <p>
                By creating an account or using the system, users acknowledge that they have read, understood, and agreed to these Terms and Conditions. Users who do not agree with these Terms must discontinue using the system.
              </p>
              <p>Users must:</p>
              <ul>
                <li>Register using accurate and complete information.</li>
                <li>Maintain updated profile information.</li>
                <li>Use their own institutional identity where applicable.</li>
                <li>Protect their account credentials.</li>
              </ul>
              <p>
                ResearchSphere reserves the right to reject, suspend, or terminate accounts containing false or misleading information.
              </p>
            </section>

            <section id="section-4" className={styles.section}>
              <h2>4. User Registration and Accounts</h2>
              <p>Each user is responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of login credentials and passwords.</li>
                <li>All activities performed using their account.</li>
                <li>Updating profile information promptly.</li>
                <li>Promptly reporting unauthorized account access.</li>
              </ul>
              <p>
                Passwords should never be shared with any other person. Each user may maintain only one account for a particular role unless otherwise approved by the system administrator.
              </p>
            </section>

            <section id="section-5" className={styles.section}>
              <h2>5. Roles and Responsibilities</h2>

              <h3>5.1 Student Responsibilities</h3>
              <p>Students agree and shall:</p>
              <ul>
                <li>Submit only original academic work.</li>
                <li>Ensure all uploaded documents are their own work or properly cited.</li>
                <li>Upload publications in PDF format and provide accurate publication details.</li>
                <li>Maintain academic integrity and respect copyright regulations.</li>
                <li>Respond to supervisor feedback professionally and revise rejected submissions where applicable.</li>
                <li>Maintain professional and respectful communication with supervisors.</li>
              </ul>
              <p>
                Students may edit submissions only within the permitted editing period before administrative validation and review begin.
              </p>

              <h3>5.2 Supervisor Responsibilities</h3>
              <p>Supervisors agree and shall:</p>
              <ul>
                <li>Review only assigned publications.</li>
                <li>Conduct fair and unbiased reviews.</li>
                <li>Maintain confidentiality of submitted research.</li>
                <li>Provide constructive and structured academic feedback.</li>
                <li>Avoid conflicts of interest.</li>
                <li>Recommend research improvements where necessary.</li>
              </ul>

              <h3>5.3 User Administrator Responsibilities</h3>
              <p>User Administrators shall:</p>
              <ul>
                <li>Manage user accounts fairly and professionally.</li>
                <li>Verify supervisor registrations and activate/deactivate user accounts.</li>
                <li>Monitor user activities and generate user-related reports.</li>
              </ul>

              <h3>5.4 Repository Administrator Responsibilities</h3>
              <p>Repository Administrators shall:</p>
              <ul>
                <li>Manage research publications and protect repository integrity.</li>
                <li>Archive or restore publications and monitor publication quality.</li>
                <li>Remove inappropriate or fraudulent content.</li>
                <li>Generate publication and repository reports.</li>
              </ul>

              <h3>5.5 Super Administrator Responsibilities</h3>
              <p>The Super Administrator has full authority over:</p>
              <ul>
                <li>User management and repository management.</li>
                <li>System configuration and administrative permissions.</li>
                <li>Overall system security and maintenance.</li>
                <li>Reviewing administrative decisions where necessary.</li>
              </ul>
            </section>

            <section id="section-6" className={styles.section}>
              <h2>6. Research Publication Policy & Workflow</h2>
              <p>
                All submitted publications shall be original, contain appropriate citations, comply with institutional research ethics and academic policies, follow accepted academic writing standards, and not infringe on intellectual property rights. Submitted information must be truthful.
              </p>
              <p>The publication workflow consists of the following stages:</p>
              <ol className={styles.numberedList}>
                <li>Draft Creation</li>
                <li>Submission</li>
                <li>Administrator Validation</li>
                <li>Duplicate Checking</li>
                <li>Supervisor Assignment</li>
                <li>Academic / Peer Review</li>
                <li>Approval or Rejection</li>
                <li>Publication</li>
              </ol>
              <p>
                Submission approval is based solely on academic evaluation and compliance with institutional policies, and is not guaranteed.
              </p>
            </section>

            <section id="section-7" className={styles.section}>
              <h2>7. Publication Status & Duplicate Research Policy</h2>
              <p>Publication statuses include:</p>
              <ul>
                <li><strong>Draft:</strong> Saved work before official submission.</li>
                <li><strong>Submitted:</strong> Submitted for initial review.</li>
                <li><strong>Administrator Validation:</strong> Under administrative quality check.</li>
                <li><strong>Under Review:</strong> Assigned to supervisor for academic evaluation.</li>
                <li><strong>Approved:</strong> Cleared review and ready for publishing.</li>
                <li><strong>Published:</strong> Publicly or institutionally accessible.</li>
                <li><strong>Rejected:</strong> Requires revision or fails criteria.</li>
                <li><strong>Archived:</strong> Saved for institutional academic records.</li>
              </ul>
              <p>
                ResearchSphere performs duplicate validation during submission. Submissions may be rejected if the title duplicates an existing publication, the content substantially matches an approved publication, academic integrity standards are violated, or copyright infringement is identified. Duplicate detection decisions remain subject to administrative review.
              </p>
            </section>

            <section id="section-8" className={styles.section}>
              <h2>8. Resubmission Policy</h2>
              <p>
                Rejected publications may be revised and resubmitted. When resubmitting, students are expected to:
              </p>
              <ul>
                <li>Address supervisor feedback and comments thoroughly.</li>
                <li>Describe newly added improvements clearly.</li>
                <li>Explain how identified research gaps have been addressed.</li>
              </ul>
              <p>
                Previous rejected versions remain available in read-only mode for comparison purposes but cannot be modified. Once a revised publication is approved, previous rejected versions may no longer be deleted.
              </p>
            </section>

            <section id="section-9" className={styles.section}>
              <h2>9. Articles and Blogs</h2>
              <p>
                Only approved publications may be converted into Articles or Blogs. Publication of Articles or Blogs requires administrative approval from the Repository Administrator. Articles and Blogs are managed separately from research publications while maintaining similar quality standards. ResearchSphere reserves the right to reject inappropriate content.
              </p>
            </section>

            <section id="section-10" className={styles.section}>
              <h2>10. Intellectual Property & Repository Access</h2>
              <p>
                Authors retain ownership of their original research. By submitting a publication, authors grant ResearchSphere permission to store publications, display approved publications, index metadata, and allow authorized users to preview and download approved works. ResearchSphere does not claim ownership of submitted research.
              </p>
              <p>
                Users may search approved publications using Title, Author, Year, Research Category, Research Subcategory, and Keywords. Repository access permissions depend on user roles.
              </p>
            </section>

            <section id="section-11" className={styles.section}>
              <h2>11. User Conduct & Notifications</h2>
              <p>Users shall not:</p>
              <ul>
                <li>Upload malicious software or abuse system resources.</li>
                <li>Share offensive or illegal content.</li>
                <li>Submit fraudulent research.</li>
                <li>Impersonate other individuals.</li>
                <li>Attempt unauthorized access or circumvent system security.</li>
                <li>Misuse supervisor communication features.</li>
              </ul>
              <p>
                Violations may result in account suspension or disciplinary action. Users agree to receive system notifications regarding submission updates, review progress, supervisor feedback, approval decisions, administrative announcements, and system maintenance.
              </p>
            </section>

            <section id="section-12" className={styles.section}>
              <h2>12. Account Security & Privacy</h2>
              <p>
                ResearchSphere employs reasonable security safeguards including password encryption, secure authentication, role-based authorization, session management, protected file storage, and activity logging. Users remain responsible for safeguarding their credentials.
              </p>
              <p>
                Collection and processing of personal information are governed by the ResearchSphere Privacy Policy.
              </p>
            </section>

            <section id="section-13" className={styles.section}>
              <h2>13. System Availability & Account Suspension</h2>
              <p>
                Although reasonable efforts are made to ensure continuous availability, ResearchSphere does not guarantee uninterrupted access due to scheduled maintenance, technical failures, security incidents, updates, or force majeure events.
              </p>
              <p>Accounts may be suspended or terminated for:</p>
              <ul>
                <li>Academic misconduct or fraudulent information.</li>
                <li>Copyright violations or false registration details.</li>
                <li>Repeated policy violations or security threats.</li>
                <li>Unauthorized access attempts or platform misuse.</li>
              </ul>
            </section>

            <section id="section-14" className={styles.section}>
              <h2>14. Account Deletion & Limitation of Liability</h2>
              <p>
                Users may request deletion of their own accounts. However, previously approved publications may remain archived for institutional academic record purposes, and certain audit records may be retained where legally or institutionally required.
              </p>
              <p>ResearchSphere shall not be liable for:</p>
              <ul>
                <li>Data loss caused by user negligence or incorrect submissions.</li>
                <li>Internet connectivity failures or delayed reviews.</li>
                <li>Third-party service interruptions.</li>
                <li>Unauthorized access resulting from compromised user credentials.</li>
              </ul>
            </section>

            <section id="section-15" className={styles.section}>
              <h2>15. Amendments & Governing Principles</h2>
              <p>
                ResearchSphere reserves the right to modify these Terms and Conditions. Users will be notified of significant updates through official system notifications. Continued use constitutes acceptance of revised terms.
              </p>
              <p>
                These Terms are operated in accordance with the principles of Academic Integrity, Ethical Research, Transparency, Fair Peer Review, Equal Opportunity, Professional Conduct, and Responsible Research Dissemination.
              </p>
            </section>

            <section id="section-16" className={styles.section}>
              <h2>16. Contact Information</h2>
              <p>
                For questions regarding these Terms and Conditions, users should contact the ResearchSphere System Administration through the official support channels provided within the application.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
