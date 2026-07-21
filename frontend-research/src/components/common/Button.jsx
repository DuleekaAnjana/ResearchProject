import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * Reusable Button component
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.iconLeft - Icon placed before text
 * @param {React.ReactNode} props.iconRight - Icon placed after text
 * @param {string} props.to - If provided, renders as a React Router Link
 * @param {string} props.href - If provided, renders as an anchor tag
 * @param {boolean} props.fullWidth - Whether button takes full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  iconLeft,
  iconRight,
  to,
  href,
  fullWidth = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ].filter(Boolean).join(' ');

  // Render as React Router Link
  if (to) {
    return (
      <Link to={to} className={classNames} {...rest}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        {children}
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </Link>
    );
  }

  // Render as anchor tag
  if (href) {
    return (
      <a href={href} className={classNames} {...rest}>
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        {children}
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </a>
    );
  }

  // Render as button
  return (
    <button className={classNames} disabled={disabled} {...rest}>
      {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {children}
      {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  );
};

export default Button;
