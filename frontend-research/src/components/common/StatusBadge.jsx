import styles from './StatusBadge.module.css';

/**
 * Category/status color mapping
 */
const CATEGORY_COLORS = {
  'computer science': 'cs',
  'medicine': 'medicine',
  'statistics': 'statistics',
  'physics': 'physics',
  'biology': 'biology',
  // Status variants
  'published': 'success',
  'approved': 'success',
  'under_review': 'warning',
  'pending': 'warning',
  'rejected': 'error',
  'draft': 'default',
};

/**
 * Reusable StatusBadge component
 * Displays category labels or status indicators
 * 
 * @param {Object} props
 * @param {string} props.text - Badge text to display
 * @param {string} props.variant - Optional explicit variant override
 * @param {string} props.className - Additional CSS classes
 */
const StatusBadge = ({ text, variant, className = '' }) => {
  // Auto-detect variant from text if not explicitly provided
  const colorVariant = variant || CATEGORY_COLORS[text.toLowerCase()] || 'default';

  return (
    <span className={`${styles.badge} ${styles[colorVariant]} ${className}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
