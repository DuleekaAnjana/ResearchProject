import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import styles from './LegalPages.module.css';

const PrivacyPage = () => {
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
              <li><a href="#privacy-4">4. Data Security</a></li>
            </ol>
          </div>

          <div className={styles.bodyContent}>
            <section id="privacy-1" className={styles.section}>
              <h2>1. Introduction</h2>
              <p>
                At ResearchSphere, we prioritize your privacy and are committed to protecting all personal information submitted during student and academic registration.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
