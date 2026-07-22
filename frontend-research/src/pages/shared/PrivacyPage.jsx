import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import styles from './LegalPages.module.css';

const PrivacyPage = () => {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className={styles.titleBadge}>
            <Lock size={16} />
            <span>Privacy Policy</span>
          </div>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <p className={styles.meta}>Last Updated: July 2026 | ResearchSphere Repository System</p>
        </div>

        <div className={styles.contentCard}>
          <div className={styles.tocBox}>
            <h2 className={styles.tocTitle}>Table of Contents</h2>
            <ol className={styles.tocList}>
              <li><a href="#privacy-1">1. Introduction</a></li>
              <li><a href="#privacy-2">2. Information We Collect</a></li>
              <li><a href="#privacy-3">3. How Information Is Used</a></li>
              <li><a href="#privacy-4">4. Publication Visibility</a></li>
              <li><a href="#privacy-5">5. Supervisor Access</a></li>
              <li><a href="#privacy-6">6. Administrator Access</a></li>
              <li><a href="#privacy-7">7. Data Security</a></li>
              <li><a href="#privacy-8">8. Cookies and Session Data</a></li>
              <li><a href="#privacy-9">9. Analytics</a></li>
              <li><a href="#privacy-10">10. Data Sharing</a></li>
              <li><a href="#privacy-11">11. Data Retention</a></li>
              <li><a href="#privacy-12">12. User Rights</a></li>
              <li><a href="#privacy-13">13. Research Integrity</a></li>
              <li><a href="#privacy-14">14. Third-Party Services</a></li>
              <li><a href="#privacy-15">15. Children's Privacy</a></li>
              <li><a href="#privacy-16">16. Changes to This Policy</a></li>
              <li><a href="#privacy-17">17. Contact Information</a></li>
            </ol>
          </div>

          <div className={styles.bodyContent}>
            <section id="privacy-1" className={styles.section}>
              <h2>1. Introduction</h2>
              <p>
                ResearchSphere is committed to protecting the privacy and personal information of all users. This Privacy Policy explains how information is collected, used, stored, protected, and disclosed while using the Student Research Publication Repository System.
              </p>
            </section>

            <section id="privacy-2" className={styles.section}>
              <h2>2. Information We Collect</h2>
              <p>The system may collect the following categories of information:</p>

              <h3>Personal & Institutional Information</h3>
              <ul>
                <li>Full Name, National Identity Card (NIC) Number, Email Address, and Telephone Number</li>
                <li>University Name, University Registration Number, Education Level, Current Degree, Previous Degrees, and Previous Universities</li>
                <li>Research Category, Research Interests, and Profile Photo</li>
              </ul>

              <h3>Account Information</h3>
              <ul>
                <li>Username, Encrypted Password, Login History, Account Status, and Assigned User Role</li>
              </ul>

              <h3>Publication Information</h3>
              <ul>
                <li>Research Title, Abstract, Keywords, Research Category, and Subcategory</li>
                <li>Research Gap Description, Uploaded PDF Documents, Publication Status</li>
                <li>Supervisor Feedback and Complete Review History</li>
              </ul>

              <h3>System Usage Information</h3>
              <ul>
                <li>Login Times, Downloads, Views, Search History, Notifications, User Interactions, and Analytics</li>
              </ul>
            </section>

            <section id="privacy-3" className={styles.section}>
              <h2>3. How Information Is Used</h2>
              <p>Collected information is used exclusively to:</p>
              <ul>
                <li>Authenticate users and manage accounts.</li>
                <li>Process publication submissions and assign appropriate supervisors.</li>
                <li>Review publications and generate detailed analytics.</li>
                <li>Improve overall user experience and system functionality.</li>
                <li>Provide automated system notifications and announcements.</li>
                <li>Maintain repository quality, research integrity, and system security.</li>
              </ul>
            </section>

            <section id="privacy-4" className={styles.section}>
              <h2>4. Publication Visibility</h2>
              <p>
                Only approved publications become publicly or institutionally visible within the Research Library. Drafts, rejected submissions, and submissions currently under review remain accessible strictly to authorized users (the author, assigned supervisor, and relevant administrators).
              </p>
            </section>

            <section id="privacy-5" className={styles.section}>
              <h2>5. Supervisor Access</h2>
              <p>Assigned supervisors may access:</p>
              <ul>
                <li>Submitted research documents for assigned students.</li>
                <li>Student profile information relevant to the academic review.</li>
                <li>Submission history and previous rejected versions for comparative review.</li>
              </ul>
              <p>Supervisors cannot access unrelated publications or unassigned student data.</p>
            </section>

            <section id="privacy-6" className={styles.section}>
              <h2>6. Administrator Access</h2>
              <p>
                Authorized administrators may access information necessary to perform their administrative responsibilities, including user management, publication management, system monitoring, report generation, and repository maintenance.
              </p>
            </section>

            <section id="privacy-7" className={styles.section}>
              <h2>7. Data Security</h2>
              <p>
                ResearchSphere implements robust technical and administrative safeguards, including strong password encryption, secure authentication protocols, role-based access control, protected file storage, active session management, activity logging, and authorization verification.
              </p>
            </section>

            <section id="privacy-8" className={styles.section}>
              <h2>8. Cookies and Session Data</h2>
              <p>
                The system uses session cookies solely to maintain active login sessions, improve user navigation, enhance user experience, and support secure authentication. No unnecessary tracking or advertising cookies are used.
              </p>
            </section>

            <section id="privacy-9" className={styles.section}>
              <h2>9. Analytics</h2>
              <p>
                ResearchSphere generates internal analytics including publication views, download counts, submission statistics, user rankings, and activity summaries. These analytics are intended solely for academic, institutional, and administrative improvement purposes.
              </p>
            </section>

            <section id="privacy-10" className={styles.section}>
              <h2>10. Data Sharing</h2>
              <p>
                ResearchSphere does <strong>not</strong> sell personal information to third parties. Information may only be shared with authorized university personnel, for academic publication management, or where required by applicable laws or institutional regulations.
              </p>
            </section>

            <section id="privacy-11" className={styles.section}>
              <h2>11. Data Retention</h2>
              <p>
                Information is retained for academic record keeping, repository management, audit purposes, and institutional reporting. Retention periods vary according to university guidelines and regulatory requirements.
              </p>
            </section>

            <section id="privacy-12" className={styles.section}>
              <h2>12. User Rights</h2>
              <p>Users have the right to:</p>
              <ul>
                <li>View their user profile and update personal information.</li>
                <li>Change account passwords securely.</li>
                <li>Download approved publications.</li>
                <li>Request account deletion (subject to institutional record retention policies).</li>
                <li>Access their complete submission and review history.</li>
              </ul>
            </section>

            <section id="privacy-13" className={styles.section}>
              <h2>13. Research Integrity</h2>
              <p>
                The system processes publication information to detect duplicate submissions, support similarity and plagiarism checking, improve publication quality, and maintain high repository integrity.
              </p>
            </section>

            <section id="privacy-14" className={styles.section}>
              <h2>14. Third-Party Services</h2>
              <p>
                Where integrated, third-party services shall only process information necessary to support essential system functionality and must strictly comply with applicable university privacy standards.
              </p>
            </section>

            <section id="privacy-15" className={styles.section}>
              <h2>15. Children's Privacy</h2>
              <p>
                ResearchSphere is intended for registered university students, academic supervisors, and authorized administrative personnel. It is not designed for or directed at children.
              </p>
            </section>

            <section id="privacy-16" className={styles.section}>
              <h2>16. Changes to This Policy</h2>
              <p>
                ResearchSphere may update this Privacy Policy from time to time. Users will be notified of significant changes through official system notifications.
              </p>
            </section>

            <section id="privacy-17" className={styles.section}>
              <h2>17. Contact Information</h2>
              <p>
                Questions regarding this Privacy Policy or the handling of personal information should be directed to the ResearchSphere System Administration through the official support channels provided within the system.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
