import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Monitor, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import styles from './ChooseRegistration.module.css';

const ChooseRegistration = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Header Section */}
        <header className={styles.header}>
          <Link to="/" className={styles.backButton}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <div className={styles.badge}>
            <Shield size={14} className={styles.badgeIcon} />
            <span>Create an Account</span>
          </div>
          <h1 className={styles.title}>Join ResearchSphere</h1>
          <p className={styles.subtitle}>
            A unified academic ecosystem designed to manage, peer-review, and publish high-quality student research with expert supervision and institutional transparency.
          </p>
        </header>

        {/* Roles Grid */}
        <div className={styles.cardsGrid}>
          {/* Student Card */}
          <div className={styles.card}>
            <div className={`${styles.iconContainer} ${styles.studentIcon}`}>
              <GraduationCap size={28} />
            </div>
            <h2 className={styles.cardTitle}>Student Author</h2>
            <p className={styles.cardDescription}>
              Register as a student to submit your research publications, receive academic reviews, track approval workflows, and publish peer-reviewed papers.
            </p>
            <div className={styles.benefits}>
              <div className={styles.benefitItem}>✓ Guided PDF uploads & duplicate checks</div>
              <div className={styles.benefitItem}>✓ Structured feedback from matching supervisors</div>
              <div className={styles.benefitItem}>✓ Access student dashboard analytics</div>
            </div>
            <Link to="/newstudentregistegpage" className={styles.cardButton}>
              <span>Register as Student</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Supervisor Card */}
          <div className={styles.card}>
            <div className={`${styles.iconContainer} ${styles.supervisorIcon}`}>
              <Monitor size={28} />
            </div>
            <h2 className={styles.cardTitle}>Academic Supervisor</h2>
            <p className={styles.cardDescription}>
              Register as an approved academic reviewer to manage assigned publications, conduct fair reviews, provide feedback, and recommend student research improvements.
            </p>
            <div className={styles.benefits}>
              <div className={styles.benefitItem}>✓ Direct assignment to relevant research domains</div>
              <div className={styles.benefitItem}>✓ Professional peer review interface</div>
              <div className={styles.benefitItem}>✓ Track review and recommendation history</div>
            </div>
            <Link to="/register?role=supervisor" className={styles.cardButton}>
              <span>Register as Supervisor</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegistration;
