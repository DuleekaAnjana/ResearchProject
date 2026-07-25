import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  CheckCheck,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import AdminSidebar from '../../components/layout/AdminSidebar';
import styles from './AdminNotificationsPage.module.css';

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('unread');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const all = await notificationService.getAll(user.email);
      setNotifications(Array.isArray(all) ? all : []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);
  const displayed = activeTab === 'unread' ? unread : activeTab === 'read' ? read : notifications;

  const handleMarkAllAsRead = async () => {
    if (!user?.email || unread.length === 0) return;
    setMarking(true);
    try {
      await notificationService.markAllAsRead(user.email);
      await fetchNotifications();
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    } finally {
      setMarking(false);
    }
  };

  const handleMarkOneRead = async (notif) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        await fetchNotifications();
      } catch (err) {
        console.warn('Failed to mark as read:', err);
      }
    }
    navigate('/admin/submissions');
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffDays >= 1) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours >= 1) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins >= 1) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className={styles.dashboardLayout}>
      {sidebarOpen && <AdminSidebar />}

      <div className={styles.mainContent}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/admin/notifications"
        />

        <main className={styles.pageBody}>
          <div className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbItem}>Home</Link>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbItem}>Admin</span>
            <ChevronRight size={14} />
            <span className={styles.breadcrumbActive}>Notifications</span>
          </div>

          <div className={styles.pageHeaderRow}>
            <div>
              <h1 className={styles.pageTitle}>Repositary Admin Notifications</h1>
              <p className={styles.pageSubtext}>
                Stay updated with student submissions and workflow tasks.
              </p>
            </div>
            {unread.length > 0 && (
              <button
                className={styles.markAllBtn}
                onClick={handleMarkAllAsRead}
                disabled={marking}
              >
                <CheckCheck size={16} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Navigation tabs */}
          <div className={styles.tabsRow}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'unread' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread ({unread.length})
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'read' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('read')}
            >
              Read ({read.length})
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({notifications.length})
            </button>
          </div>

          {/* Notifications List Card */}
          <div className={styles.card}>
            {loading ? (
              <div className={styles.stateContainer}>
                <div className={styles.spinner} />
                <p>Loading notifications...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className={styles.stateContainer}>
                <div className={styles.emptyIcon}>
                  <Bell size={36} />
                </div>
                <p className={styles.emptyTitle}>No notifications here</p>
                <p className={styles.emptyDesc}>
                  {activeTab === 'unread'
                    ? "You are all caught up! No unread notifications found."
                    : "No notifications found in this view."}
                </p>
              </div>
            ) : (
              <div className={styles.notifList}>
                {displayed.map((notif) => (
                  <div
                    key={notif.id}
                    className={`${styles.notifItem} ${!notif.read ? styles.notifUnread : ''}`}
                    onClick={() => handleMarkOneRead(notif)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleMarkOneRead(notif);
                    }}
                  >
                    <div className={styles.notifHeader}>
                      <span className={styles.notifTitle}>{notif.title}</span>
                      {!notif.read && <span className={styles.newBadge}>New</span>}
                    </div>
                    <p className={styles.notifDesc}>{notif.description}</p>
                    <span className={styles.notifTime}>{getRelativeTime(notif.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className={styles.footer}>
          <span>&copy; 2026 ResearchSphere &mdash; Repository Administration Portal.</span>
          <span>v1.0 proto</span>
        </footer>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
