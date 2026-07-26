import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Plus, X, AlertCircle, Info } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Register.module.css';

const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

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
  'Diploma',
];

const CATEGORIES = [
  'Computer Science',
  'Medicine',
  'Statistics',
  'Physics',
  'Biology',
  'Engineering',
  'Other (Specify Your Research Path)',
];

const SUBCATEGORIES = {
  'Computer Science': ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Software Engineering', 'Cybersecurity'],
  'Medicine': ['Medical Imaging', 'Pharmacology', 'Genomics', 'Public Health'],
  'Statistics': ['Biostatistics', 'Bayesian Inference', 'Data Analysis'],
  'Physics': ['Quantum Computing', 'Astrophysics', 'Condensed Matter'],
  'Biology': ['Genetics', 'Microbiology', 'Bioinformatics'],
  'Engineering': ['Robotics', 'Electrical Engineering', 'Civil Engineering'],
  'Other (Specify Your Research Path)': [],
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
    gender: '',
    university: '',
    customUniversity: '',
    faculty: '',
    department: '',
    registrationNumber: '',
    currentDegree: '',
    educationLevel: '',
    researchCategory: 'Computer Science',
    researchSubcategories: [],
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
  const [userClosedGuide, setUserClosedGuide] = useState(false);
  const [showCustomSubcategoryInput, setShowCustomSubcategoryInput] = useState(false);
  const [customSubcategoryVal, setCustomSubcategoryVal] = useState('');

  const validateField = (name, value, currentFormData = formData) => {
    switch (name) {
      case 'fullName':
        if (!value || !value.trim()) return 'Please enter your full name.';
        return '';

      case 'nicNumber': {
        const val = (value || '').trim();
        if (!val) return 'Please enter your National Identity Card number.';
        if (!/^\d{12}$/.test(val)) return 'NIC must need 12 digits.';
        return '';
      }

      case 'dateOfBirth': {
        if (!value) return 'Please select your Date of Birth.';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(selectedDate.getTime()) || selectedDate >= today) {
          return 'Date of Birth must be a previous date from current date.';
        }
        return '';
      }

      case 'email':
        if (!value || !value.trim()) return 'Please enter your email address.';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address.';
        return '';

      case 'phoneNumber': {
        if (!value || !value.trim()) return 'Please enter your phone number.';
        const clean = value.replace(/\s+/g, '');
        const isIntl = /^\+94\d{9}$/.test(clean);
        if (!isIntl) {
          return 'Include phone number with country code\n(e.g: +94 77 123 4567)';
        }
        return '';
      }

      case 'university':
        if (!value) return 'Please select your current university.';
        return '';

      case 'faculty':
        if (!value || !value.trim()) return 'Please enter your current faculty.';
        return '';

      case 'department':
        if (!value || !value.trim()) return 'Please enter your current department.';
        return '';

      case 'registrationNumber':
        return '';

      case 'currentDegree':
        if (!value || !value.trim()) return 'Please enter your current degree name.';
        return '';

      case 'educationLevel':
        if (!value) return 'Please select your education level.';
        return '';

      case 'password': {
        if (!value) return 'Please enter a password.';
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(value)) {
          return 'Password must include at least eight characters, one letter, one number, and one special character.';
        }
        return '';
      }

      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== currentFormData.password) return 'Passwords do not match.';
        return '';

      default:
        return '';
    }
  };

  const handleNicBlur = async () => {
    const val = formData.nicNumber.trim();
    if (/^\d{12}$/.test(val)) {
      try {
        const isTaken = await api.get(`/auth/check-nic?nic=${encodeURIComponent(val)}`);
        if (isTaken) {
          setErrors((prev) => ({ ...prev, nicNumber: 'Entered NIC is already registered.' }));
        }
      } catch (e) {
        console.error('Error checking NIC:', e);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updatedFormData);

    if (type !== 'checkbox') {
      const fieldError = validateField(name, newValue, updatedFormData);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));

      if (name === 'password') {
        if (updatedFormData.confirmPassword) {
          const confirmErr = validateField('confirmPassword', updatedFormData.confirmPassword, updatedFormData);
          setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
        }
        if (fieldError) {
          setUserClosedGuide(false);
          setShowPasswordGuide(true);
        } else {
          setShowPasswordGuide(false);
        }
      }
    }

    if (serverError) setServerError('');
    if (validationAlert) setValidationAlert('');
  };

  const handlePasswordFocus = () => {
    if (!userClosedGuide) {
      setShowPasswordGuide(true);
    }
  };

  const handleClosePasswordGuide = () => {
    setShowPasswordGuide(false);
    setUserClosedGuide(true);
  };

  // Add/Remove Previous Degrees
  const handleAddPreviousDegree = () => {
    setFormData((prev) => ({
      ...prev,
      previousDegrees: [
        ...prev.previousDegrees,
        { degree: '', university: '', customUniversity: '' },
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
    if (selectedSub === 'Other (Specify Research Subcategories / Interests)') {
      setShowCustomSubcategoryInput(true);
      return;
    }
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

  const handleAddCustomSubcategory = () => {
    if (customSubcategoryVal.trim() && !formData.researchSubcategories.includes(customSubcategoryVal.trim())) {
      setFormData((prev) => ({
        ...prev,
        researchSubcategories: [...prev.researchSubcategories, customSubcategoryVal.trim()],
      }));
      setCustomSubcategoryVal('');
      setShowCustomSubcategoryInput(false);
    }
  };

  // Form Validation with Simple Phrase Notification
  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = [
      'fullName',
      'nicNumber',
      'dateOfBirth',
      'email',
      'phoneNumber',
      'university',
      'faculty',
      'department',
      'currentDegree',
      'educationLevel',
      'password',
      'confirmPassword',
    ];

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, formData[field], formData);
      if (err) newErrors[field] = err;
    });

    if (formData.university === 'Other (Specify Your University)' && !formData.customUniversity?.trim()) {
      newErrors.university = 'Please specify your university name.';
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
    const resolvedUniversity = formData.university === 'Other (Specify Your University)'
      ? formData.customUniversity
      : formData.university;

    const resolvedPreviousDegrees = formData.previousDegrees.map(deg => ({
      degree: deg.degree,
      university: deg.university === 'Other (Specify Your University)' ? deg.customUniversity : deg.university
    }));

    try {
      await register({
        ...formData,
        university: resolvedUniversity,
        previousDegrees: resolvedPreviousDegrees,
        role: 'student',
      });

      // Clear filled data after successful registration
      setFormData({
        fullName: '',
        nicNumber: '',
        dateOfBirth: '',
        email: '',
        phoneNumber: '',
        gender: '',
        university: '',
        customUniversity: '',
        faculty: '',
        department: '',
        registrationNumber: '',
        currentDegree: '',
        educationLevel: '',
        researchCategory: '',
        researchSubcategories: [],
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

  const isFormIncompleteOrInvalid = () => {
    const requiredFields = [
      'fullName',
      'nicNumber',
      'dateOfBirth',
      'email',
      'phoneNumber',
      'university',
      'faculty',
      'department',
      'currentDegree',
      'educationLevel',
      'password',
      'confirmPassword',
    ];

    for (const field of requiredFields) {
      if (!formData[field] || validateField(field, formData[field], formData)) {
        return true;
      }
    }

    if (formData.university === 'Other (Specify Your University)' && !formData.customUniversity?.trim()) {
      return true;
    }

    if (Object.values(errors).some((err) => !!err)) {
      return true;
    }

    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      return true;
    }

    return false;
  };

  const isSubmitDisabled = isSubmitting || isFormIncompleteOrInvalid();

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
          <Button
            to="/chooseregistration"
            variant="outline"
            size="md"
            iconLeft={<ArrowLeft size={16} />}
          >
            Back to select role
          </Button>
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
                  onBlur={handleNicBlur}
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
                  max={getYesterdayString()}
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
                <label className={styles.label}>Phone Number *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="+94 77 123 4567 or +94 11 234 5678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ''}`}
                />
                {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
              </div>

              {/* Gender Selection Dropdown */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Gender <span className={styles.optionalLabel}>(Optional)</span></label>
                <div className={styles.selectWrapper}>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
              </div>
            </div>

            {/* University Details Section */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Current Studying University Details</span>
            </div>

            <div className={styles.fieldGrid}>
              {/* University Dropdown */}
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
                    <option value="Other (Specify Your University)">Other (Specify Your University)</option>
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
                {errors.university && <span className={styles.errorText}>{errors.university}</span>}
              </div>

              {/* Custom University input if Other chosen */}
              {formData.university === 'Other (Specify Your University)' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Specify University *</label>
                  <input
                    type="text"
                    name="customUniversity"
                    placeholder="Enter institution name"
                    value={formData.customUniversity}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              )}

              {/* Faculty */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Faculty *</label>
                <input
                  type="text"
                  name="faculty"
                  placeholder="e.g. Faculty of Science"
                  value={formData.faculty}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.faculty ? styles.inputError : ''}`}
                />
                {errors.faculty && <span className={styles.errorText}>{errors.faculty}</span>}
              </div>

              {/* Department */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Department *</label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Department of Computer Science"
                  value={formData.department}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.department ? styles.inputError : ''}`}
                />
                {errors.department && <span className={styles.errorText}>{errors.department}</span>}
              </div>

              {/* Registration Number (Optional) */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Registration Number <span className={styles.optionalLabel}>(Optional)</span></label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="e.g. 2024/CS/1001"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={styles.input}
                />
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
                    <div className={styles.selectWrapper}>
                      <select
                        value={deg.university}
                        onChange={(e) => handlePreviousDegreeChange(idx, 'university', e.target.value)}
                        className={styles.select}
                      >
                        <option value="">Select University</option>
                        {UNIVERSITIES.map((uni) => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                        <option value="Other (Specify Your University)">Other (Specify Your University)</option>
                      </select>
                      <ChevronDown className={styles.selectIcon} size={16} />
                    </div>

                    {deg.university === 'Other (Specify Your University)' && (
                      <input
                        type="text"
                        placeholder="Specify University"
                        value={deg.customUniversity || ''}
                        onChange={(e) => handlePreviousDegreeChange(idx, 'customUniversity', e.target.value)}
                        className={styles.input}
                        style={{ marginTop: '0.5rem' }}
                      />
                    )}
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
                        researchSubcategories: [],
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
                <label className={styles.label}>Add Research Subcategories / Research Interests <span className={styles.optionalLabel}>(Optional)</span></label>
                <div className={styles.selectWrapper}>
                  <select
                    onChange={handleAddSubcategory}
                    value=""
                    className={styles.select}
                  >
                    <option value="" disabled>-- Select & add subcategories / Interests --</option>
                    {(SUBCATEGORIES[formData.researchCategory] || []).map((sub) => (
                      <option key={sub} value={sub} disabled={formData.researchSubcategories.includes(sub)}>
                        {sub} {formData.researchSubcategories.includes(sub) ? '(Selected)' : ''}
                      </option>
                    ))}
                    <option value="Other (Specify Research Subcategories / Interests)">Other (Specify Research Subcategories / Interests)</option>
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>

                {showCustomSubcategoryInput && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Specify Custom Subcategory / Interest"
                      value={customSubcategoryVal}
                      onChange={(e) => setCustomSubcategoryVal(e.target.value)}
                      className={styles.input}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSubcategory}
                      className={styles.addDegreeBtn}
                      style={{ marginTop: 0, padding: '0.5rem' }}
                    >
                      Add
                    </button>
                  </div>
                )}
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
                          onClick={handleClosePasswordGuide}
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
                    onFocus={handlePasswordFocus}
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
