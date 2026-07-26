import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const ROLE_CONFIGS = {
  student: {
    title: 'Student sign-in',
    subtitle: 'Access your dashboard and continue your research journey.',
    heroText: 'Track your publications, receive feedback and discover new research across your field.',
    demoEmail: 'demo@researchsphere.edu',
    redirectPath: '/student/dashboard',
  },
  supervisor: {
    title: 'Supervisor sign-in',
    subtitle: 'Access your dashboard and review assigned research papers.',
    heroText: 'Review student submissions, provide structured feedback and guide academic research.',
    demoEmail: 'supervisor@researchsphere.edu',
    redirectPath: '/supervisor/dashboard',
  },
  admin: {
    title: 'Administrator sign-in',
    subtitle: 'Manage users, publications, and repository settings.',
    heroText: 'Oversee system operations, curate research categories and manage department workflows.',
    demoEmail: 'admin@researchsphere.edu',
    redirectPath: '/admin/dashboard',
  },
};

const ROLE_THEMES = {
  student: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    textColor: '#1e3a8a',
    quoteColor: '#1e40af',
    authorColor: '#3b82f6',
    logoBg: '#2563eb'
  },
  supervisor: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    textColor: '#14532d',
    quoteColor: '#166534',
    authorColor: '#10b981',
    logoBg: '#10b981'
  },
  admin: {
    background: 'linear-gradient(135deg, #fefdf0 0%, #fef9c3 100%)',
    textColor: '#713f12',
    quoteColor: '#a16207',
    authorColor: '#ca8a04',
    logoBg: '#ca8a04'
  }
};

const Login = ({ roleProp }) => {
  const { role: routeRole } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  // Determine role from props, route params, or search query (default: student)
  const roleKey = roleProp || routeRole || searchParams.get('role') || 'student';
  const roleConfig = ROLE_CONFIGS[roleKey] || ROLE_CONFIGS.student;
  const theme = ROLE_THEMES[roleKey] || ROLE_THEMES.student;

  const registeredSuccess = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await login(email, password, rememberMe, roleKey);
      const userRole = response?.role || roleKey;
      if (userRole === 'repositary admin' && roleKey !== 'admin') {
        logout();
        setError('Repository Admin must sign in through the administrator portal.');
        return;
      }
      // Navigate to Student Dashboard or role-specific dashboard after successful sign-in
      if (userRole === 'supervisor') {
        navigate('/supervisor/dashboard');
      } else if (userRole === 'repositary admin' || userRole.includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Branding / Testimonial Side */}
      <div className={styles.leftPanel} style={{ background: theme.background, borderRight: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div className={styles.leftHeader}>
          <Link to="/" className={styles.logo}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="16" fill={theme.logoBg} />
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
            <span className={styles.logoTitle} style={{ color: theme.textColor }}>ResearchSphere</span>
          </Link>
        </div>

        <div className={styles.leftBody}>
          <p className={styles.heroText} style={{ color: theme.textColor, opacity: 1 }}>{roleConfig.heroText}</p>

          <div className={styles.testimonial}>
            <p className={styles.quote} style={{ color: theme.quoteColor }}>
              &ldquo;ResearchSphere transformed how our department manages student publications.&rdquo;
            </p>
            <p className={styles.author} style={{ color: theme.authorColor }}>
              PROF. R. SILVA, UNIVERSITY OF SRI JAYAWARDENAPURA
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className={styles.rightPanel}>
        <div className={styles.topNav} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/#signin" className={styles.backLink} style={{ color: theme.logoBg }}>
            <ArrowLeft size={16} /> Back to Select Role
          </Link>
          <Link to="/" className={styles.backLink}>
            Back to home
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title} style={{ color: theme.textColor }}>{roleConfig.title}</h1>
          <p className={styles.subtitle}>{roleConfig.subtitle}</p>

          {registeredSuccess && (
            <div style={{
              backgroundColor: '#ecfdf5',
              color: '#047857',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              fontWeight: '500'
            }}>
              Account created successfully! Please sign in with your credentials.
            </div>
          )}

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Email Address */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={roleConfig.demoEmail || "demo@researchsphere.edu"}
                className={styles.input}
                style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
                required
              />
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <Link to="/forgot-password" className={styles.forgotLink} style={{ color: theme.logoBg }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={styles.input}
                  style={{ paddingRight: '2.5rem', borderColor: 'rgba(226, 232, 240, 0.8)' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.customCheckbox} style={{ borderColor: theme.logoBg, backgroundColor: rememberMe ? theme.logoBg : 'transparent' }}>
                {rememberMe && <Check size={12} />}
              </span>
              <span>Remember me on this device</span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              style={{ backgroundColor: theme.logoBg, borderColor: theme.logoBg }}
            >
              Sign in
            </Button>
          </form>

          {/* Footer Link */}
          <p className={styles.footerText}>
            New to ResearchSphere?{' '}
            <Link to={`/register?role=${roleKey}`} className={styles.footerLink} style={{ color: theme.logoBg }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
