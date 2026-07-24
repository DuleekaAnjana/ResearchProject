import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Plus, X, AlertCircle, Info } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './NewSupervisorRegister.module.css';

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

const ACADEMIC_POSITIONS = [
  'Teaching Assistant',
  'Assistant Lecturer',
  'Lecturer',
  'Senior Lecturer',
  'Associate Professor',
  'Professor',
  'Emeritus Professor',
  'Research Fellow',
  'Senior Research Fellow',
  'Postdoctoral Researcher',
  'Industry Researcher',
  'Other (Specify)',
];

const HIGHEST_QUALIFICATIONS = [
  "Bachelor's Degree",
  "Bachelor's Degree (Honours)",
  "Master's Degree",
  "Master of Philosophy (MPhil)",
  "Doctor of Philosophy (PhD)",
  "Doctor of Science (DSc)",
  "Professional Doctorate",
  "Postdoctoral Qualification",
  "Other (Specify)",
];

const EXPERIENCE_YEARS = [
  'Less than 1 Year',
  '1–3 Years',
  '4–6 Years',
  '7–10 Years',
  '11–15 Years',
  'More than 15 Years',
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

const NewSupervisorRegister = () => {
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
    academicPosition: '',
    customAcademicPosition: '',
    employeeId: '',

    highestQualification: '',
    customHighestQualification: '',
    previousDegrees: [],
    yearsOfTeachingExperience: '',
    yearsOfResearchExperience: '',
    professionalBiography: '',

    researchCategory: 'Computer Science',
    researchSubcategories: [],
    researchInterests: '',

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
        const isLocal = /^0\d{9}$/.test(clean);
        const isIntl = /^\+94\d{9}$/.test(clean);
        if (!isLocal && !isIntl) {
          return 'Include phone number with country code            (e.g: +94 77 123 4567)';
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

      case 'academicPosition':
        if (!value) return 'Please select your academic position.';
        return '';

      case 'highestQualification':
        if (!value) return 'Please select your highest academic qualification.';
        return '';

      case 'yearsOfTeachingExperience':
        if (!value) return 'Please select your teaching experience.';
        return '';

      case 'yearsOfResearchExperience':
        if (!value) return 'Please select your research experience.';
        return '';

      case 'professionalBiography':
        if (!value || !value.trim()) return 'Please write a brief professional biography.';
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

  // Add/Remove Previous Degrees (Optional)
  const handleAddPreviousDegree = () => {
    setFormData((prev) => ({
      ...prev,
      previousDegrees: [
        ...prev.previousDegrees,
        { degree: '', university: '' },
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

  // Form Validation
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
      'academicPosition',
      'highestQualification',
      'yearsOfTeachingExperience',
      'yearsOfResearchExperience',
      'professionalBiography',
      'password',
      'confirmPassword',
    ];

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, formData[field], formData);
      if (err) newErrors[field] = err;
    });

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

    // Resolve "Other (Specify)" values if selected
    const universityValue = formData.university === 'Other (Specify)' 
      ? formData.customUniversity 
      : formData.university;
    const academicPositionValue = formData.academicPosition === 'Other (Specify)' 
      ? formData.customAcademicPosition 
      : formData.academicPosition;
    const highestQualificationValue = formData.highestQualification === 'Other (Specify)' 
      ? formData.customHighestQualification 
      : formData.highestQualification;

    try {
      await register({
        ...formData,
        university: universityValue,
        academicPosition: academicPositionValue,
        highestQualification: highestQualificationValue,
        role: 'supervisor',
      });

      // Clear filled data
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
        academicPosition: '',
        customAcademicPosition: '',
        employeeId: '',
        highestQualification: '',
        customHighestQualification: '',
        previousDegrees: [],
        yearsOfTeachingExperience: '',
        yearsOfResearchExperience: '',
        professionalBiography: '',
        researchCategory: 'Computer Science',
        researchSubcategories: [],
        researchInterests: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        acceptPrivacy: false,
      });

      navigate(`/login?role=supervisor&registered=true`);
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
      'academicPosition',
      'highestQualification',
      'yearsOfTeachingExperience',
      'yearsOfResearchExperience',
      'professionalBiography',
      'password',
      'confirmPassword',
    ];

    for (const field of requiredFields) {
      if (!formData[field] || validateField(field, formData[field], formData)) {
        return true;
      }
    }

    if (formData.university === 'Other (Specify)' && !formData.customUniversity.trim()) return true;
    if (formData.academicPosition === 'Other (Specify)' && !formData.customAcademicPosition.trim()) return true;
    if (formData.highestQualification === 'Other (Specify)' && !formData.customHighestQualification.trim()) return true;

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
              <circle cx="16" cy="16" r="16" fill="#10b981" />
              <path d="M10 12C10 10.8954 10.8954 10 12 10H20C21.1046 10 22 10.8954 22 12V20C22 21.1046 21.1046 22 20 22H12C10.8954 22 10 21.1046 10 20V12Z" fill="white" fillOpacity="0.3" />
              <path d="M13 14L16 11L19 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 11V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 18H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className={styles.logoTitle}>ResearchSphere</span>
          </Link>
        </div>

        <div className={styles.leftBody}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', lineHeight: 1.3 }}>
            Join Our Network of Academic Experts
          </h2>
          <p className={styles.heroText}>
            Mentor & Elevate Research — Register as a ResearchSphere Supervisor to review scholarly publications, provide expert guidance, and help shape the next generation of academic research.
          </p>

          <div className={styles.testimonial}>
            <p className={styles.quote}>
              &ldquo;Mentoring the next generation of researchers is highly streamlined on ResearchSphere.&rdquo;
            </p>
            <p className={styles.author}>
              PROF. R. SILVA, UNIVERSITY OF COLOMBO
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
          <h1 className={styles.title}>Register Account - Supervisor Portal</h1>
          <p className={styles.subtitle} style={{ marginBottom: '1.25rem', color: 'var(--color-primary-green)' }}>
            Join our network of academic reviewers. Fill in your professional credentials below.
          </p>

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
                  placeholder="e.g. Prof. Ranjith Silva"
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
                  placeholder="e.g. 197012345678"
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
                  placeholder="e.g. 0772635452, 011 1111 111 or +9411 1111 111"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ''}`}
                />
                {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
              </div>

              {/* Gender (Optional) */}
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

            {/* Institutional Information Details Section */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Institutional Information Details</span>
            </div>

            <div className={styles.fieldGrid}>
              {/* University dropdown */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>University / Institution *</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.university ? styles.inputError : ''}`}
                  >
                    <option value="" disabled>Select University / Institution</option>
                    {UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                    <option value="Other (Specify)">Other (Specify)</option>
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
                {errors.university && <span className={styles.errorText}>{errors.university}</span>}
              </div>

              {/* Custom University input if Other chosen */}
              {formData.university === 'Other (Specify)' && (
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

              {/* Academic Position */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Academic Position *</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="academicPosition"
                    value={formData.academicPosition}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.academicPosition ? styles.inputError : ''}`}
                  >
                    <option value="" disabled>Select Current Academic Position</option>
                    {ACADEMIC_POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
                {errors.academicPosition && <span className={styles.errorText}>{errors.academicPosition}</span>}
              </div>

              {/* Custom Academic Position input if Other chosen */}
              {formData.academicPosition === 'Other (Specify)' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Specify Academic Position *</label>
                  <input
                    type="text"
                    name="customAcademicPosition"
                    placeholder="Enter academic position"
                    value={formData.customAcademicPosition}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              )}

              {/* Employee ID (Optional) */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Employee / Staff ID <span className={styles.optionalLabel}>(Optional)</span></label>
                <input
                  type="text"
                  name="employeeId"
                  placeholder="e.g. EMP12345"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Academic Qualifications Section */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Academic Qualifications</span>
            </div>

            <div className={styles.fieldGrid}>
              {/* Highest Academic Qualification Dropdown */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Highest Academic Qualification *</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="highestQualification"
                    value={formData.highestQualification}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.highestQualification ? styles.inputError : ''}`}
                  >
                    <option value="" disabled>Select Highest Academic Qualification</option>
                    {HIGHEST_QUALIFICATIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
                {errors.highestQualification && <span className={styles.errorText}>{errors.highestQualification}</span>}
              </div>

              {/* Custom Highest Qualification */}
              {formData.highestQualification === 'Other (Specify)' && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Specify Highest Qualification *</label>
                  <input
                    type="text"
                    name="customHighestQualification"
                    placeholder="Enter highest qualification"
                    value={formData.customHighestQualification}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              )}

              {/* Years of Teaching Experience */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Years of Teaching Experience *</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="yearsOfTeachingExperience"
                    value={formData.yearsOfTeachingExperience}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.yearsOfTeachingExperience ? styles.inputError : ''}`}
                  >
                    <option value="" disabled>Select Teaching Experience</option>
                    {EXPERIENCE_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
                {errors.yearsOfTeachingExperience && <span className={styles.errorText}>{errors.yearsOfTeachingExperience}</span>}
              </div>

              {/* Years of Research Experience */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Years of Research Experience *</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="yearsOfResearchExperience"
                    value={formData.yearsOfResearchExperience}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.yearsOfResearchExperience ? styles.inputError : ''}`}
                  >
                    <option value="" disabled>Select Research Experience</option>
                    {EXPERIENCE_YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectIcon} size={16} />
                </div>
                {errors.yearsOfResearchExperience && <span className={styles.errorText}>{errors.yearsOfResearchExperience}</span>}
              </div>
            </div>

            {/* Previously Completed Degrees (Optional) */}
            <div className={styles.subsectionHeader} style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <span className={styles.subsectionTitle}>Previously Completed Degrees <span className={styles.optionalLabel}>(Optional)</span></span>
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
                      placeholder="e.g. Master of Science"
                      value={deg.degree}
                      onChange={(e) => handlePreviousDegreeChange(idx, 'degree', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>University / Institution</label>
                    <input
                      type="text"
                      placeholder="e.g. University of Moratuwa"
                      value={deg.university}
                      onChange={(e) => handlePreviousDegreeChange(idx, 'university', e.target.value)}
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
              style={{ marginBottom: '1.25rem' }}
            >
              <Plus size={16} /> Add Previously Completed Degree
            </button>

            {/* Professional Biography */}
            <div className={styles.fieldGroup} style={{ width: '100%' }}>
              <label className={styles.label}>Professional Biography *</label>
              <textarea
                name="professionalBiography"
                placeholder="A brief overview of your academic and research career..."
                value={formData.professionalBiography}
                onChange={handleChange}
                className={`${styles.textarea} ${errors.professionalBiography ? styles.inputError : ''}`}
                rows={4}
              />
              {errors.professionalBiography && <span className={styles.errorText}>{errors.professionalBiography}</span>}
            </div>

            {/* Research Domain & Specializations Section */}
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

              {/* Research Subcategory (Optional tag selection) */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Research Subcategory <span className={styles.optionalLabel}>(Optional)</span></label>
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

            {/* Research Interests Keywords */}
            <div className={styles.fieldGroup} style={{ width: '100%', marginTop: '1rem' }}>
              <label className={styles.label}>Research Interests / Keywords</label>
              <input
                type="text"
                name="researchInterests"
                placeholder="e.g. Deep Learning, Computer Vision, Bioinformatics"
                value={formData.researchInterests}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            {/* Account Security Section */}
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Account Security</span>
            </div>

            <div className={styles.fieldGrid}>
              {/* Password */}
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitDisabled}
            >
              Create Supervisor Account
            </Button>
          </form>

          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login?role=supervisor" className={styles.footerLink}>
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

export default NewSupervisorRegister;
