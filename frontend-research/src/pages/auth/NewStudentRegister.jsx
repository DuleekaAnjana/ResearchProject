import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

const UNIVERSITIES = [
  'University of Colombo',
  'University of Peradeniya',
  'University of Moratuwa',
  'University of Kelaniya',
  'University of Sri Jayewardenepura',
];

const EDUCATION_LEVELS = [
  'Undergraduate',
  'Postgraduate (Master)',
  'Doctoral (PhD)',
  'Diploma',
];

const CATEGORIES = [
  'Computer Science',
  'Medicine',
  'Statistics',
  'Physics',
  'Biology',
  'Engineering',
];

const SUBCATEGORIES = {
  'Computer Science': ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Software Engineering', 'Cybersecurity'],
  'Medicine': ['Medical Imaging', 'Pharmacology', 'Genomics', 'Public Health'],
  'Statistics': ['Biostatistics', 'Bayesian Inference', 'Data Analysis'],
  'Physics': ['Quantum Computing', 'Astrophysics', 'Condensed Matter'],
  'Biology': ['Genetics', 'Microbiology', 'Bioinformatics'],
  'Engineering': ['Robotics', 'Electrical Engineering', 'Civil Engineering'],
};

const NewStudentRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    nicNumber: '',
    email: '',
    phoneNumber: '',
    university: 'University of Colombo',
    registrationNumber: '',
    currentDegree: 'BSc Honours in Computer Science',
    educationLevel: 'Undergraduate',
    researchCategory: 'Computer Science',
    researchSubcategory: 'Artificial Intelligence',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    setServerError('');

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      newErrors.terms = 'You must accept the terms and privacy policy';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ ...formData, role: 'student' });
      navigate(`/auth/student/login?registered=true`);
    } catch (err) {
      console.error('Registration failed:', err);
      setServerError(err.message || 'Registration failed. Please try again.');
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
          <p className={styles.heroText}>
            Join a trusted academic platform to index your research work, receive supervisor inputs, and showcase your publication.
          </p>

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
          <Link to="/chooseregistration" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to role options
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Submit & Disseminate Your Research</h1>
          <p className={styles.subtitle} style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            Register to easily upload your PDF publications, secure expert feedback, and share your peer-reviewed academic findings with the global community.
          </p>

          {serverError && <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>{serverError}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGrid}>
              {/* Full Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Amara Perera"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              {/* NIC Number */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>NIC Number</label>
                <input
                  type="text"
                  name="nicNumber"
                  placeholder="200112345678"
                  value={formData.nicNumber}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              {/* Phone Number */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="+94 71 234 5678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              {/* University */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>University</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    {UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>

              {/* Registration Number */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="2024/CS/1001"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              {/* Current Degree */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Current Degree</label>
                <input
                  type="text"
                  name="currentDegree"
                  placeholder="BSc Honours in Computer Science"
                  value={formData.currentDegree}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              {/* Education Level */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Education Level</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>

              {/* Research Category */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Research Category</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="researchCategory"
                    value={formData.researchCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        researchCategory: cat,
                        researchSubcategory: SUBCATEGORIES[cat]?.[0] || '',
                      }));
                    }}
                    className={styles.select}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>

              {/* Research Subcategory */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Research Subcategory</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="researchSubcategory"
                    value={formData.researchSubcategory}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    {(SUBCATEGORIES[formData.researchCategory] || []).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>

              {/* Password */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                />
                {errors.confirmPassword && (
                  <span className={styles.errorText}>{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className={styles.checkboxInput}
                />
                <span className={styles.customCheckbox}>
                  {formData.acceptTerms && <Check size={12} />}
                </span>
                <span>
                  I accept the <Link to="/terms" className={styles.inlineLink}>Terms of Service</Link>
                </span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onChange={handleChange}
                  className={styles.checkboxInput}
                />
                <span className={styles.customCheckbox}>
                  {formData.acceptPrivacy && <Check size={12} />}
                </span>
                <span>
                  I accept the <Link to="/privacy" className={styles.inlineLink}>Privacy Policy</Link>
                </span>
              </label>

              {errors.terms && <p className={styles.errorText}>{errors.terms}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              Create Student account
            </Button>
          </form>

          {/* Footer Navigation */}
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/auth/student/login" className={styles.footerLink}>
              Back to sign-in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewStudentRegister;
