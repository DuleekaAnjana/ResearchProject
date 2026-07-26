import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Key, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import SupervisorSidebar from '../../components/layout/SupervisorSidebar';
import styles from './SupervisorProfilePage.module.css';

const SupervisorProfilePage = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form States
  const [profileData, setProfileData] = useState({
    id: null,
    fullName: 'Amara Perera',
    nicNumber: '2001082596',
    email: 'amara.perera@researchsphere.edu',
    phoneNumber: '+94 706300027',
    university: 'University of Colombo',
    employeeId: '2024/CS/1000', // Used for Registration Number
    highestQualification: 'BSc Honours in Computer Science', // Current Degree
    academicPosition: 'Master', // Education Level
    previouslyCompletedDegreesJson: 'Diploma in Software Engineering', // Previous Degrees
    faculty: 'SLIIT', // Used for Previous Universities
    researchCategory: 'Computer Science',
    researchSubcategoriesJson: 'Artificial Intelligence',
    professionalBiography: 'Passionate researcher focused on applying artificial intelligence to real-world problems in healthcare, education, and sustainability.',
    password: ''
  });

  // Security Form States
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const email = user?.email || 'demo@researchsphere.edu';
        const data = await api.get(`/supervisor/profile?email=${encodeURIComponent(email)}`);
        if (data) {
          setProfileData(prev => ({
            ...prev,
            ...data,
            password: '' // Don't expose password
          }));
        }
      } catch (err) {
        console.error('Failed to load profile data, using default seeded state.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const data = await api.put('/supervisor/profile', profileData);
      if (data) {
        setProfileData(prev => ({
          ...prev,
          ...data,
          password: ''
        }));
        setSuccessMsg('Personal information updated successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to save profile details:', err);
      setErrorMsg('Failed to save personal information.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmNewPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }
    if (securityData.newPassword !== securityData.confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    try {
      const updated = {
        ...profileData,
        password: securityData.newPassword
      };
      await api.put('/supervisor/profile', updated);
      setSuccessMsg('Password changed successfully!');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to change password:', err);
      setErrorMsg('Failed to change password.');
    }
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Are you absolutely sure you want to delete your supervisor account? This action is permanent.');
    if (confirm) {
      alert('Delete request has been logged. Please contact administration to complete.');
    }
  };

  const displayName = profileData.fullName || 'Amara Perera';
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && <SupervisorSidebar />}

      <div className={styles.mainContent}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/supervisor/notifications"
        />

        <main className={styles.pageBody}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbItem}>Home</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbActive}>Profile</span>
          </div>

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Profile</h1>
            <p className={styles.pageSubtext}>
              Manage your researcher profile and account settings.
            </p>
          </div>

          {successMsg && (
            <div style={{ padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <div className={styles.profileLayoutGrid}>
            {/* Left Card: Photo / Meta */}
            <div className={styles.leftProfileCard}>
              <div className={styles.avatarCircle}>{displayInitials}</div>
              <h2 className={styles.profileName}>{displayName}</h2>
              <span className={styles.profileRole}>Supervisor</span>
              <span className={styles.profileJoined}>Joined Jul 2025</span>
              <button type="button" className={styles.changePhotoBtn}>
                Change photo
              </button>
            </div>

            {/* Right Column Forms */}
            <div className={styles.rightFormsCol}>
              {/* Form 1: Personal Info */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Personal Information</h3>
                <form onSubmit={handleSaveProfile}>
                  <div className={styles.formGrid}>
                    <div>
                      <label className={styles.inputLabel}>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleProfileChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>NIC</label>
                      <input
                        type="text"
                        name="nicNumber"
                        value={profileData.nicNumber}
                        onChange={handleProfileChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        readOnly
                        className={`${styles.textInput} ${styles.readOnlyInput}`}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Phone</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleProfileChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>University</label>
                      <select
                        name="university"
                        value={profileData.university}
                        onChange={handleProfileChange}
                        className={styles.selectInput}
                      >
                        <option value="University of Colombo">University of Colombo</option>
                        <option value="University of Moratuwa">University of Moratuwa</option>
                        <option value="SLIIT">SLIIT</option>
                        <option value="University of Kelaniya">University of Kelaniya</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Registration Number</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={profileData.employeeId}
                        onChange={handleProfileChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Current Degree</label>
                      <input
                        type="text"
                        name="highestQualification"
                        value={profileData.highestQualification}
                        onChange={handleProfileChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Education Level</label>
                      <select
                        name="academicPosition"
                        value={profileData.academicPosition}
                        onChange={handleProfileChange}
                        className={styles.selectInput}
                      >
                        <option value="Master">Master</option>
                        <option value="PhD">PhD</option>
                        <option value="Professor">Professor</option>
                        <option value="Senior Lecturer">Senior Lecturer</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Previous Degrees</label>
                      <input
                        type="text"
                        name="previouslyCompletedDegreesJson"
                        value={profileData.previouslyCompletedDegreesJson}
                        onChange={handleProfileChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Previous Universities</label>
                      <input
                        type="text"
                        name="faculty"
                        value={profileData.faculty}
                        onChange={handleProfileChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Research Category</label>
                      <select
                        name="researchCategory"
                        value={profileData.researchCategory}
                        onChange={handleProfileChange}
                        className={styles.selectInput}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Medicine">Medicine</option>
                        <option value="Engineering">Engineering</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Research Subcategory</label>
                      <select
                        name="researchSubcategoriesJson"
                        value={profileData.researchSubcategoriesJson}
                        onChange={handleProfileChange}
                        className={styles.selectInput}
                      >
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Machine Learning">Machine Learning</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Software Engineering">Software Engineering</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    <label className={styles.inputLabel}>Biography</label>
                    <textarea
                      name="professionalBiography"
                      value={profileData.professionalBiography}
                      onChange={handleProfileChange}
                      rows={4}
                      className={styles.textareaInput}
                    />
                  </div>

                  <div className={styles.btnRow}>
                    <button type="submit" className={styles.saveBtn}>
                      Save changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Form 2: Security */}
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Security</h3>
                <form onSubmit={handleChangePassword}>
                  <div className={styles.formGrid}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className={styles.inputLabel}>Current password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={securityData.currentPassword}
                        onChange={handleSecurityChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>New password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={securityData.newPassword}
                        onChange={handleSecurityChange}
                        className={styles.textInput}
                      />
                    </div>
                    <div>
                      <label className={styles.inputLabel}>Confirm new password</label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={securityData.confirmNewPassword}
                        onChange={handleSecurityChange}
                        className={styles.textInput}
                      />
                    </div>
                  </div>

                  <div className={styles.btnRow}>
                    <button type="submit" className={styles.securityBtn}>
                      <Key size={14} /> Change password
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 3: Delete Account */}
              <div className={`${styles.card} ${styles.deleteCard}`}>
                <h3 className={styles.deleteTitle}>Delete account</h3>
                <div className={styles.deleteWrapper}>
                  <p className={styles.deleteText}>
                    Permanently delete your ResearchSphere account. Published research will remain in the repository, credited to your name.
                  </p>
                  <button type="button" onClick={handleDeleteAccount} className={styles.deleteBtn}>
                    <Trash2 size={14} /> Delete account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <span>&copy; 2026 ResearchSphere &mdash; Supervisor Research Review Portal.</span>
          <span>v1.0 proto</span>
        </footer>
      </div>
    </div>
  );
};

export default SupervisorProfilePage;
