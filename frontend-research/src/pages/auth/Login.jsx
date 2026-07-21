import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
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

const Login = ({ roleProp }) => {
  const { role: routeRole } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Determine role from props, route params, or search query (default: student)
  const roleKey = roleProp || routeRole || searchParams.get('role') || 'student';
  const roleConfig = ROLE_CONFIGS[roleKey] || ROLE_CONFIGS.student;

  const registeredSuccess = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await login(email, password);
      // Navigate to Student Dashboard or role-specific dashboard after successful sign-in
      const userRole = response?.role || roleKey;
      if (userRole === 'supervisor') {
        navigate('/supervisor/dashboard');
      } else if (userRole.includes('admin')) {
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
      <div className={styles.leftPanel}>
        <div className={styles.leftHeader}>
          <Link to="/" className={styles.logo}>
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
            <span className={styles.logoTitle}>ResearchSphere</span>
          </Link>
        </div>

        <div className={styles.leftBody}>
          <p className={styles.heroText}>{roleConfig.heroText}</p>

          <div className={styles.testimonial}>
            <p className={styles.quote}>
              &ldquo;ResearchSphere transformed how our department manages student publications.&rdquo;
            </p>
            <p className={styles.author}>
              PROF. B. SILVA, UNIVERSITY OF COLOMBO
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className={styles.rightPanel}>
        <div className={styles.topNav}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>{roleConfig.title}</h1>
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
                placeholder="demo@researchsphere.edu"
                className={styles.input}
                required
              />
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
              />
            </div>

            {/* Remember Me Checkbox */}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.customCheckbox}>
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
            >
              Sign in
            </Button>
          </form>

          {/* Footer Link */}
          <p className={styles.footerText}>
            New to ResearchSphere?{' '}
            <Link to="/register" className={styles.footerLink}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
