import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

/**
 * Public Navbar component
 * Matches the Lovable screenshot: Logo | Center Nav | Register + Sign In / Dashboard
 */
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: 'Sign In', to: '/#signin' },
    { label: 'Features', to: '/#features' },
    { label: 'Disciplines', to: '/#disciplines' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const isActive = (path) => location.pathname === path;

  const dashboardPath = user?.role === 'supervisor' 
    ? '/supervisor/dashboard' 
    : user?.role?.includes('admin') 
      ? '/admin/dashboard' 
      : '/student/dashboard';

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="16" fill="#2563eb" />
              <path
                d="M10 12C10 10.8954 10.8954 10 12 10H20C21.1046 10 22 10.8954 22 12V20C22 21.1046 21.1046 22 20 22H12C10.8954 22 10 21.1046 10 20V12Z"
                fill="white"
                fillOpacity="0.3"
              />
              <path
                d="M13 14L16 11L19 14"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 11V20"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12 18H20"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>ResearchSphere</span>
            <span className={styles.logoSubtitle}>RESEARCH REPOSITORY</span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <ul className={styles.navLinks}>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`${styles.navLink} ${isActive(link.to) ? styles.navLinkActive : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side Actions */}
        <div className={styles.navActions}>
          {isAuthenticated ? (
            <>
              <Button
                to={dashboardPath}
                variant="primary"
                size="md"
                iconLeft={<LayoutDashboard size={16} />}
              >
                Dashboard
              </Button>
              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginLeft: '0.5rem'
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className={styles.registerLink}>
                Register
              </Link>
              <Button
                to="/login"
                variant="primary"
                size="md"
                iconRight={<ArrowRight size={16} />}
              >
                Sign in
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <ul className={styles.mobileNavLinks}>
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={styles.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className={styles.mobileActions}>
              <Button
                to="/register"
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Button>
              <Button
                to="/login"
                variant="primary"
                size="lg"
                fullWidth
                iconRight={<ArrowRight size={16} />}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
