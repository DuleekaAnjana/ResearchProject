import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

/**
 * Reusable SearchBar component
 * 
 * @param {Object} props
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {string} props.className - Additional CSS classes
 */
const SearchBar = ({
  placeholder = 'Search publications...',
  value = '',
  onChange,
  onSubmit,
  className = '',
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to search API
    if (onSubmit) onSubmit(value);
  };

  return (
    <form
      className={`${styles.searchBar} ${className}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <Search className={styles.icon} size={18} />
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label="Search publications"
      />
    </form>
  );
};

export default SearchBar;
