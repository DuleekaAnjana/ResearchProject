import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardHeader from '../../components/layout/DashboardHeader';
import StudentSidebar from '../../components/layout/StudentSidebar';
import StudentFooter from '../../components/layout/StudentFooter';
import dashboardStyles from './StudentDashboard.module.css';

const SubmissionStatusPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'All';
  const displayTabName = tab.charAt(0).toUpperCase() + tab.slice(1);

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
            justifyContent: 'space-between' 
          }}
        >
          <div 
            style={{ 
              padding: '2rem', 
              background: '#ffffff', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              marginTop: '1rem',
              flex: 1
            }}
          >
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Submission Status ({displayTabName})
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
              Submission Status. This page will be built in a future phase.
            </p>
          </div>
          <StudentFooter />
        </div>
      </div>
    </div>
  );
};

export default SubmissionStatusPage;
