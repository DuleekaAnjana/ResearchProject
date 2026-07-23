import styles from './StudentFooter.module.css';

const StudentFooter = () => {
  return (
    <footer className={styles.footer}>
      <span>© 2026 ResearchSphere — Student Research Publication Repository.</span>
      <div className={styles.footerLinks}>
        <span className={styles.footerLink}>v1.0 prototype</span>
        <span className={styles.footerLink}>Privacy</span>
        <span className={styles.footerLink}>Terms</span>
      </div>
    </footer>
  );
};

export default StudentFooter;
