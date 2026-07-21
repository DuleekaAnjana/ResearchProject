import styles from './StatCounter.module.css';

/**
 * Statistic counter display (e.g., "12,480 PUBLICATIONS")
 * 
 * @param {Object} props
 * @param {string} props.value - The stat number to display
 * @param {string} props.label - Label below the number
 * @param {string} props.className - Additional CSS classes
 */
const StatCounter = ({ value, label, className = '' }) => {
  return (
    <div className={`${styles.stat} ${className}`}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default StatCounter;
