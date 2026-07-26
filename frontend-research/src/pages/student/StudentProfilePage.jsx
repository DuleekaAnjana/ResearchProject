import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Award, BookOpen, 
  Calendar, Lock, Eye, EyeOff, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StudentSidebar from '../../components/layout/StudentSidebar';
import StudentFooter from '../../components/layout/StudentFooter';
import dashboardStyles from './StudentDashboard.module.css';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility State
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status message
  const [status, setStatus] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      setLoading(true);
      try {
        const data = await api.get(`/auth/student-profile?email=${encodeURIComponent(user.email)}`);
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.email]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus({ type: 'error', text: 'All fields are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: 'error', text: 'Password must be at least 6 characters long.' });
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
        setStatus({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: 'error', 
        text: err?.message || 'Failed to change password. Please verify current password.' 
      });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className={dashboardStyles.dashboardLayout}>
      {sidebarOpen && <StudentSidebar />}
      <div className={dashboardStyles.mainContainer}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          notificationsRoute="/student/notifications"
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
              
              {/* Header profile banner card */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
                  borderRadius: '16px', 
                  padding: '2.5rem', 
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)',
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
                    color: '#2563eb', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '2.25rem', 
                    fontWeight: 800,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {(profile?.fullName || user?.name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                    {profile?.fullName || user?.name}
                  </h1>
                  <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '1.1rem', fontWeight: 500 }}>
                    Registered Student · {profile?.registrationNumber || 'N/A'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Category: {profile?.researchCategory || user?.researchCategory || 'Computer Science'}
                    </span>
                    <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {profile?.educationLevel || 'Undergraduate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column details cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                
                {/* Profile details */}
                <div 
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '16px', 
                    padding: '2rem', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <User size={18} color="#2563eb" />
                    Personal Information
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <Mail size={16} color="#64748b" style={{ marginTop: '0.2rem' }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{profile?.email}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <Phone size={16} color="#64748b" style={{ marginTop: '0.2rem' }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Phone Number</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{profile?.phoneNumber || 'N/A'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <Calendar size={16} color="#64748b" style={{ marginTop: '0.2rem' }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Date of Birth</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <MapPin size={16} color="#64748b" style={{ marginTop: '0.2rem' }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>University & Department</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                          {profile?.university || 'University of Colombo'} · {profile?.department || 'Faculty of Science'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <BookOpen size={16} color="#64748b" style={{ marginTop: '0.2rem' }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Registered Subspecializations</span>
                        <span style={{ fontSize: '0.90rem', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>
                          {profile?.researchSubcategoriesJson || 'None registered'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password update form */}
                <div 
                  style={{ 
                    background: '#ffffff', 
                    borderRadius: '16px', 
                    padding: '2rem', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <Lock size={18} color="#2563eb" />
                    Security & Password
                  </h3>

                  {status && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px', 
                      fontSize: '0.85rem', 
                      fontWeight: 600,
                      marginBottom: '1rem',
                      backgroundColor: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
                      color: status.type === 'success' ? '#15803d' : '#b91c1c',
                      border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {status.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Current Password Field with Eye Icon */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Current Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{ width: '100%', padding: '0.625rem 2.5rem 0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                        >
                          {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password Field with Eye Icon */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{ width: '100%', padding: '0.625rem 2.5rem 0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password Field with Eye Icon */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Confirm New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{ width: '100%', padding: '0.625rem 2.5rem 0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passLoading}
                      style={{ 
                        marginTop: '0.5rem',
                        padding: '0.625rem 1rem', 
                        backgroundColor: '#2563eb', 
                        color: '#ffffff', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        fontSize: '0.9rem'
                      }}
                    >
                      {passLoading ? 'Saving...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
          <StudentFooter />
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
