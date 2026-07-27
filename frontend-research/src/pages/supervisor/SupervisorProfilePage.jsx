import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Award, BookOpen, 
  Calendar, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  Briefcase, GraduationCap, FileText, Bookmark, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import SupervisorSidebar from '../../components/layout/SupervisorSidebar';
import dashboardStyles from '../student/StudentDashboard.module.css';

const SupervisorProfilePage = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // Status/Alert messages
  const [profileStatus, setProfileStatus] = useState(null);
  const [securityStatus, setSecurityStatus] = useState(null);

  // Profile Data state
  const [profileData, setProfileData] = useState({
    id: null,
    fullName: '',
    nicNumber: '',
    email: '',
    phoneNumber: '',
    university: '',
    faculty: '',
    department: '',
    academicPosition: '',
    employeeId: '',
    highestQualification: '',
    previouslyCompletedDegreesJson: '',
    yearsOfTeachingExperience: '',
    yearsOfResearchExperience: '',
    professionalBiography: '',
    researchCategory: '',
    researchSubcategoriesJson: '',
    researchInterests: '',
    registeredDate: null
  });

  // Password Update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const fetchProfile = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await api.get(`/supervisor/profile?email=${encodeURIComponent(user.email)}`);
      if (data) {
        setProfileData(data);
      }
    } catch (err) {
      console.error('Failed to load supervisor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus(null);
    setSaveLoading(true);
    try {
      const data = await api.put('/supervisor/profile', profileData);
      if (data) {
        setProfileData(data);
        setProfileStatus({ type: 'success', text: 'Profile information updated successfully!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
      setProfileStatus({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSecurityStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityStatus({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setSecurityStatus({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        email: user.email,
        currentPassword,
        newPassword
      });
      if (res) {
        setSecurityStatus({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setSecurityStatus({ 
        type: 'error', 
        text: err?.message || 'Failed to change password. Please verify current password.' 
      });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className={dashboardStyles.dashboardLayout}>
      {sidebarOpen && <SupervisorSidebar />}
      
      <div className={dashboardStyles.mainContainer}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationsRoute="/supervisor/notifications"
        />

        <div 
          className={dashboardStyles.contentWrapper}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 'calc(100vh - 64px)', 
            justifyContent: 'space-between',
            padding: '2rem'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '400px', fontSize: '1.1rem', color: '#64748b' }}>
              Loading Profile Details...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
              
              {/* Header profile banner card (Green Theme) */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  borderRadius: '16px', 
                  padding: '2.5rem', 
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  flexWrap: 'wrap'
                }}
              >
                <div 
                  style={{ 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: '50%', 
                    backgroundColor: '#ffffff', 
                    color: '#059669', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '2.25rem', 
                    fontWeight: 800,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {(profileData.fullName || user?.name || 'E').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                    {profileData.fullName}
                  </h1>
                  <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '1.1rem', fontWeight: 500 }}>
                    Registered Supervisor · {profileData.employeeId || 'N/A'}
                  </p>
                  <p style={{ margin: '0.25rem 0 0', opacity: 0.8, fontSize: '0.95rem', fontWeight: 400 }}>
                    Joined {profileData.registeredDate ? formatDate(profileData.registeredDate) : '25 Jul 2025'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Category: {profileData.researchCategory || 'Computer Science'}
                    </span>
                    <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Position: {profileData.academicPosition || 'Master'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column details cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                
                {/* Profile Details Edit Form */}
                <div 
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '16px', 
                    padding: '2rem', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    gridColumn: 'span 2'
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <User size={18} color="#059669" />
                    Supervisor Profile Information
                  </h3>

                  {profileStatus && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px', 
                      fontSize: '0.85rem', 
                      fontWeight: 600,
                      marginBottom: '1rem',
                      backgroundColor: profileStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                      color: profileStatus.type === 'success' ? '#15803d' : '#b91c1c',
                      border: `1px solid ${profileStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      {profileStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {profileStatus.text}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    
                    {/* Full Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Full Name</label>
                      <input 
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        required
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Email (ReadOnly) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Email Address</label>
                      <input 
                        type="email"
                        value={profileData.email}
                        readOnly
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.925rem', cursor: 'not-allowed' }}
                      />
                    </div>

                    {/* Phone Number */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Phone Number</label>
                      <input 
                        type="text"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* NIC Number */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>NIC Number</label>
                      <input 
                        type="text"
                        name="nicNumber"
                        value={profileData.nicNumber}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Date of Birth</label>
                      <input 
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Gender */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Gender</label>
                      <select 
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* University */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>University</label>
                      <input 
                        type="text"
                        name="university"
                        value={profileData.university}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Faculty */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Faculty</label>
                      <input 
                        type="text"
                        name="faculty"
                        value={profileData.faculty}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Department */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Department</label>
                      <input 
                        type="text"
                        name="department"
                        value={profileData.department}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Employee ID */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Employee ID</label>
                      <input 
                        type="text"
                        name="employeeId"
                        value={profileData.employeeId}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Highest Qualification */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Highest Qualification</label>
                      <input 
                        type="text"
                        name="highestQualification"
                        value={profileData.highestQualification}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Academic Position */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Academic Position</label>
                      <select 
                        name="academicPosition"
                        value={profileData.academicPosition}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      >
                        <option value="Senior Lecturer I">Senior Lecturer I</option>
                        <option value="Senior Lecturer II">Senior Lecturer II</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="Professor">Professor</option>
                        <option value="Assistant Lecturer">Assistant Lecturer</option>
                        <option value="Master">Master</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>

                    {/* Years of Teaching Experience */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Years of Teaching Experience</label>
                      <input 
                        type="text"
                        name="yearsOfTeachingExperience"
                        value={profileData.yearsOfTeachingExperience}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Years of Research Experience */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Years of Research Experience</label>
                      <input 
                        type="text"
                        name="yearsOfResearchExperience"
                        value={profileData.yearsOfResearchExperience}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Research Category */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Research Category</label>
                      <select 
                        name="researchCategory"
                        value={profileData.researchCategory}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Engineering">Engineering</option>
                      </select>
                    </div>

                    {/* Research Subcategories */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Research Subspecializations (Comma Separated)</label>
                      <input 
                        type="text"
                        name="researchSubcategoriesJson"
                        value={profileData.researchSubcategoriesJson}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Research Interests */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Research Interests</label>
                      <input 
                        type="text"
                        name="researchInterests"
                        value={profileData.researchInterests}
                        onChange={handleInputChange}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                    </div>

                    {/* Professional Biography */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Professional Biography</label>
                      <textarea 
                        name="professionalBiography"
                        value={profileData.professionalBiography}
                        onChange={handleInputChange}
                        rows={4}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>

                    {/* Submit Button */}
                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="submit"
                        disabled={saveLoading}
                        style={{
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.625rem 1.75rem',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      >
                        {saveLoading ? 'Saving...' : 'Save Profile Details'}
                      </button>
                    </div>

                  </form>
                </div>

                {/* Password Update Card */}
                <div 
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '16px', 
                    padding: '2rem', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    gridColumn: 'span 2'
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <Lock size={18} color="#059669" />
                    Security & Password Update
                  </h3>

                  {securityStatus && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px', 
                      fontSize: '0.85rem', 
                      fontWeight: 600,
                      marginBottom: '1rem',
                      backgroundColor: securityStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                      color: securityStatus.type === 'success' ? '#15803d' : '#b91c1c',
                      border: `1px solid ${securityStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      {securityStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {securityStatus.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Current Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Current Password</label>
                      <input 
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 2.5rem 0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        style={{ position: 'absolute', right: '0.75rem', bottom: '0.6rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* New Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>New Password</label>
                      <input 
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 2.5rem 0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        style={{ position: 'absolute', right: '0.75rem', bottom: '0.6rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Confirm New Password</label>
                      <input 
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.625rem 2.5rem 0.625rem 0.875rem', outline: 'none', fontSize: '0.925rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        style={{ position: 'absolute', right: '0.75rem', bottom: '0.6rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Save Security Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button
                        type="submit"
                        disabled={passLoading}
                        style={{
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.625rem 1.75rem',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      >
                        {passLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>

                  </form>
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorProfilePage;
