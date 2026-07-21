import StatusBadge from './StatusBadge';
import styles from './PublicationCard.module.css';

/**
 * Publication card shown on the Home page and listings
 * 
 * @param {Object} props
 * @param {Object} props.publication - Publication data object
 * @param {string} props.publication.title - Publication title
 * @param {string} props.publication.category - Category name
 * @param {boolean} props.publication.isPeerReviewed - Whether peer reviewed
 * @param {string} props.publication.readTime - Estimated read time
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const PublicationCard = ({ publication, onClick, className = '' }) => {
  const { title, category, isPeerReviewed, readTime } = publication;

  return (
    <article
      className={`${styles.card} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <StatusBadge text={category} />
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.meta}>
        {isPeerReviewed && <span>Peer reviewed</span>}
        {isPeerReviewed && readTime && <span className={styles.dot}>·</span>}
        {readTime && <span>{readTime}</span>}
      </p>
    </article>
  );
};

export default PublicationCard;
