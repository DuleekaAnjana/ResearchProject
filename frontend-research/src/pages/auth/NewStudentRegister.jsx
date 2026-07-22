import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Plus, X, AlertCircle, Info } from 'lucide-react';
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
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    university: '',
    registrationNumber: '',
    currentDegree: '',
    educationLevel: '',
    researchCategory: 'Computer Science',
    researchSubcategories: ['Artificial Intelligence'],
    previousDegrees: [],
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [validationAlert, setValidationAlert] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);

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
    if (validationAlert) setValidationAlert('');
  };

  // Add/Remove Previous Degrees
  const handleAddPreviousDegree = () => {
    setFormData((prev) => ({
      ...prev,
      previousDegrees: [
        ...prev.previousDegrees,
        { degree: '', university: '', registrationNumber: '' },
      ],
    }));
  };

  const handlePreviousDegreeChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.previousDegrees];
      updated[index][field] = value;
      return { ...prev, previousDegrees: updated };
    });
  };

  const handleRemovePreviousDegree = (index) => {
    setFormData((prev) => ({
      ...prev,
      previousDegrees: prev.previousDegrees.filter((_, i) => i !== index),
    }));
  };

  // Subcategory Multi-select handler
  const handleAddSubcategory = (e) => {
    const selectedSub = e.target.value;
    if (!selectedSub) return;
    if (!formData.researchSubcategories.includes(selectedSub)) {
      setFormData((prev) => ({
        ...prev,
        researchSubcategories: [...prev.researchSubcategories, selectedSub],
      }));
    }
  };

  const handleRemoveSubcategory = (subToRemove) => {
    setFormData((prev) => ({
      ...prev,
      researchSubcategories: prev.researchSubcategories.filter((s) => s !== subToRemove),
    }));
  };

  // Form Validation with Simple Phrase Notification
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    }

    // NIC Validation: 12 digits string format
    const nicRegex = /^\d{12}$/;
    if (!formData.nicNumber) {
      newErrors.nicNumber = 'Please enter your National Identity Card number.';
    } else if (!nicRegex.test(formData.nicNumber.trim())) {
      newErrors.nicNumber = 'National Identity Card number must contain exactly 12 numerical digits.';
    }

    // DOB Validation: Must be at least 15 years old from current date
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Please select your Date of Birth.';
    } else {
      const dobDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (isNaN(dobDate.getTime()) || age < 15) {
        newErrors.dateOfBirth = 'You must be at least 15 years old to complete registration.';
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone Number Validation: 9 digits excluding +94 prefix
    const phoneClean = formData.phoneNumber.replace('+94', '').replace(/\s+/g, '');
    const phoneRegex = /^\d{9}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Please enter your phone number.';
    } else if (!phoneRegex.test(phoneClean)) {
      newErrors.phoneNumber = 'Phone number must have exactly 9 digits excluding +94.';
    }

    // University
    if (!formData.university) {
      newErrors.university = 'Please select your current university.';
    }

    // Registration Number
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Please enter your university registration number.';
    }

    // Current Degree
    if (!formData.currentDegree.trim()) {
      newErrors.currentDegree = 'Please enter your current degree name.';
    }

    // Education Level
    if (!formData.educationLevel) {
      newErrors.educationLevel = 'Please select your education level.';
    }

    // Password Validation: at least 8 characters, 1 letter, 1 number, 1 special character
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Please enter a password.';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must include at least eight characters, one letter, one number, and one special character.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      newErrors.terms = 'Please accept both Terms of Service and Privacy Policy to continue.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setValidationAlert('Please correct the highlighted fields in the form before submitting.');
      return false;
    }

    setValidationAlert('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        ...formData,
        role: 'student',
      });

      // Clear filled data after successful registration
      setFormData({
        fullName: '',
        nicNumber: '',
        dateOfBirth: '',
        email: '',
        phoneNumber: '',
        university: '',
        registrationNumber: '',
        currentDegree: '',
        educationLevel: '',
        researchCategory: 'Computer Science',
        researchSubcategories: ['Artificial Intelligence'],
        previousDegrees: [],
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        acceptPrivacy: false,
      });

      navigate(`/auth/student/login?registered=true`);
    } catch (err) {
      console.error('Registration failed:', err);
      setServerError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || !formData.acceptTerms || !formData.acceptPrivacy;

  return (
    <div className={styles.container}>
      {/* Left Branding Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.leftHeader}>
          <Link to="/" className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#2563eb" />
              <path d="M10 12C10 10.8954 10.8954 10 12 10H20C21.1046 10 22 10.8954 22 12V20C22 21.1046 21.1046 22 20 22H12C10.8954 22 10 21.1046 10 20V12Z" fill="white" fillOpacity="0.3" />
              <path d="M13 14L16 11L19 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 11V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 18H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
              PROF. B. SILVA, UNIVERSITY OF SRI JAYAWARDENAPURA
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className={styles.rightPanel}>
        <div className={styles.topNav}>
          <Link to="/chooseregistration" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to select role
          </Link>
        </div>

        <div className={styles.formContainer}>
          <h1 className={styles.title}>Join or Register - Student Portal</h1>
          <p className={styles.subtitle} style={{ marginBottom: '1.25rem', color: 'var(--color-primary)' }}>
            Submit & Disseminate Your Research — Register to easily upload your PDF publications, secure expert feedback, and share your peer-reviewed academic findings.
          </p>

          {/* Simple phrase alert notification on validation failure */}
          {validationAlert && (
            <div className={styles.validationAlert}>
              <AlertCircle size={18} className={styles.validationAlertIcon} />
              <span>{validationAlert}</span>
            </div>
          )}

          {serverError && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>{serverError}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Personal Details Section */}
            <div className={styles.sectionHeader} style={{ marginTop: 0 }}>
              <span className={styles.sectionTitle}>Personal Information</span>
            </div>

            <div className={styles.fieldGrid}>
              {/* Full Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Amara Perera"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              {/* NIC Number */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>NIC Number (12 Digits) *</label>
                <input
                  type="text"
                  name="nicNumber"
                  placeholder="e.g. 200112345678"
                  value={formData.nicNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.nicNumber ? styles.inputError : ''}`}
                />
                {errors.nicNumber && <span className={styles.errorText}>{errors.nicNumber}</span>}
              </div>

              {/* Date of Birth */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.dateOfBirth ? styles.inputError : ''}`}
                />
                {errors.dateOfBirth && <span className={styles.errorText}>{errors.dateOfBirth}</span>}
              </div>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address *</label>
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
                <label className={styles.label}>Phone Number (9 Digits) *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="e.g. 771234567 or +94 771234567"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ''}`}
                />
                {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
              </div>
            </div>

            {/* University Details Section */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Current Studying University Details</span>
            </div>

            <div className={styles.fieldGrid}>
              {/* University Dropdown with Placeholder */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>University *</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.university ? styles.inputError : ''}`}
                  >
                    <option value="" disabled>Select your current university</option>
                    {UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
                {errors.university && <span className={styles.errorText}>{errors.university}</span>}
              </div>

              {/* Registration Number */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="e.g. 2024/CS/1001"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.registrationNumber ? styles.inputError : ''}`}
                />
                {errors.registrationNumber && <span className={styles.errorText}>{errors.registrationNumber}</span>}
              </div>

              {/* Current Degree */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Current Degree *</label>
                <input
                  type="text"
                  name="currentDegree"
                  placeholder="e.g. BSc Honours in Computer Science"
                  value={formData.currentDegree}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.currentDegree ? styles.inputError : ''}`}
                />
                {errors.currentDegree && <span className={styles.errorText}>{errors.currentDegree}</span>}
              </div>

              {/* Education Level Dropdown with Placeholder */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Education Level *</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.educationLevel ? styles.inputError : ''}`}
                  >
                    <option value="" disabled>Select your current degree type</option>
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
                {errors.educationLevel && <span className={styles.errorText}>{errors.educationLevel}</span>}
              </div>
            </div>

            {/* Previously Completed Degrees Section (Optional) */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Previously Completed Degrees</span>
              <span className={styles.optionalBadge}>(Optional)</span>
            </div>

            {formData.previousDegrees.map((deg, idx) => (
              <div key={idx} className={styles.degreeRow}>
                <button
                  type="button"
                  onClick={() => handleRemovePreviousDegree(idx)}
                  className={styles.removeDegreeBtn}
                >
                  <X size={14} /> Remove
                </button>

                <div className={styles.fieldGrid} style={{ marginTop: '0.5rem' }}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Completed Degree</label>
                    <input
                      type="text"
                      placeholder="e.g. Higher Diploma in IT"
                      value={deg.degree}
                      onChange={(e) => handlePreviousDegreeChange(idx, 'degree', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>University / Institution</label>
                    <input
                      type="text"
                      placeholder="e.g. University of Colombo"
                      value={deg.university}
                      onChange={(e) => handlePreviousDegreeChange(idx, 'university', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Registration / Student ID</label>
                    <input
                      type="text"
                      placeholder="e.g. HD/2021/045"
                      value={deg.registrationNumber}
                      onChange={(e) => handlePreviousDegreeChange(idx, 'registrationNumber', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddPreviousDegree}
              className={styles.addDegreeBtn}
            >
              <Plus size={16} /> Add Previous Degree
            </button>

            {/* Academic & Research Interests Section */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Research Domain & Specializations</span>
            </div>

            <div className={styles.fieldGrid}>
              {/* Research Category */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Research Category *</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="researchCategory"
                    value={formData.researchCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        researchCategory: cat,
                        researchSubcategories: [SUBCATEGORIES[cat]?.[0] || ''],
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

              {/* Research Subcategory (Multi Select) */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Add Research Subcategories *</label>
                <div className={styles.selectWrapper}>
                  <select
                    onChange={handleAddSubcategory}
                    value=""
                    className={styles.select}
                  >
                    <option value="" disabled>-- Select & add subcategories --</option>
                    {(SUBCATEGORIES[formData.researchCategory] || []).map((sub) => (
                      <option key={sub} value={sub} disabled={formData.researchSubcategories.includes(sub)}>
                        {sub} {formData.researchSubcategories.includes(sub) ? '(Selected)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>
            </div>

            {/* Selected Subcategory Tags Display */}
            {formData.researchSubcategories.length > 0 && (
              <div className={styles.tagContainer}>
                {formData.researchSubcategories.map((sub) => (
                  <span key={sub} className={styles.tagChip}>
                    {sub}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(sub)}
                      className={styles.tagRemoveBtn}
                      title="Remove subcategory"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Password Section */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Account Security</span>
            </div>

            <div className={styles.fieldGrid}>
              {/* Password Field with Arrowed Guidance Tooltip */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password *</label>
                <div className={styles.passwordGuidanceWrapper}>
                  {showPasswordGuide && (
                    <div className={styles.passwordGuideBox}>
                      <div className={styles.passwordGuideHeader}>
                        <span><Info size={14} style={{ display: 'inline', marginRight: 4 }} /> Password Requirements</span>
                        <button
                          type="button"
                          onClick={() => setShowPasswordGuide(false)}
                          className={styles.closeGuideBtn}
                          title="Close guide"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div>
                        Please enter at least eight characters including at least one letter, one number, and one special character.
                      </div>
                      <div style={{ marginTop: 4 }}>
                        Example: <span className={styles.passwordExample}>123abc*#</span>
                      </div>
                    </div>
                  )}

                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onFocus={() => setShowPasswordGuide(true)}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  />
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
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
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? 'Registering Account...' : 'Create Student Account'}
            </Button>
          </form>

          {/* Footer Navigation & Support Links */}
          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/auth/student/login" className={styles.footerLink}>
              Back to sign-in
            </Link>
          </p>

          <Link to="/contact" className={styles.supportLink}>
            Having any issues with registration? <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewStudentRegister;
