import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import styles from './LegalPages.module.css';

const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message. ResearchSphere administration will get back to you shortly.');
  };

  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className={styles.titleBadge}>
            <Mail size={16} />
            <span>Support & Assistance</span>
          </div>
          <h1 className={styles.pageTitle}>Contact Administration</h1>
          <p className={styles.meta}>Reach out to the ResearchSphere system administrators</p>
        </div>

        <div className={styles.contactGrid}>
          <div className={styles.contactInfoCard}>
            <h2>Get in Touch</h2>
            <p className={styles.contactSub}>
              Have questions regarding Terms & Conditions, Privacy Policies, or system access? Send us a message or reach out directly.
            </p>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Mail size={20} />
                </div>
                <div>
                  <h3>Email Administration</h3>
                  <p>support@researchsphere.edu</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Phone size={20} />
                </div>
                <div>
                  <h3>System Support Line</h3>
                  <p>+1 (800) 555-RS-HELP</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h3>Office Location</h3>
                  <p>Research & Repository Center, Main University Campus</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contactFormCard}>
            <h2>Send a Direct Message</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input id="name" type="text" placeholder="e.g. Dr. Alex Morgan or Student ID" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" placeholder="yourname@university.edu" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <input id="subject" type="text" placeholder="e.g. Policy Inquiry / Account Issue" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="Describe your question or issue in detail..." required></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                <Send size={16} /> Send Message quickly
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
