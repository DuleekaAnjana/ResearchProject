import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

/**
 * Footer component matching the Lovable screenshot
 * Shows copyright on the left, Privacy/Terms/Contact links on the right
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          © {currentYear} ResearchSphere.
        </p>
        <div className={styles.links}>
          <Link to="/privacy" className={styles.link}>Privacy</Link>
          <Link to="/terms" className={styles.link}>Terms</Link>
          <Link to="/contact" className={styles.link}>Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
