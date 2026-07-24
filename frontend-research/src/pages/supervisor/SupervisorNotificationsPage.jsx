import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import DashboardHeader from '../../components/layout/DashboardHeader';
import SupervisorSidebar from '../../components/layout/SupervisorSidebar';
import styles from './SupervisorNotificationsPage.module.css';
import dashboardStyles from './SupervisorDashboard.module.css';

/**
 * SupervisorNotificationsPage – Full list view of all supervisor notifications.
 */
const SupervisorNotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('unread');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ---- Fetch notifications ----
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

  // ---- Derived lists by tab ----
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);
  const displayed = activeTab === 'unread' ? unread : activeTab === 'read' ? read : notifications;

  // ---- Handlers ----
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
    if (notif.read) return;
    try {
      await notificationService.markAsRead(notif.id);
      await fetchNotifications();
    } catch (err) {
      console.warn('Failed to mark as read:', err);
    }
  };

  // ---- Relative time ----
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
    <div className={dashboardStyles.dashboardLayout}>
      {/* Sidebar */}
      {sidebarOpen && <SupervisorSidebar />}

      {/* Main */}
      <div className={dashboardStyles.mainContent}>
        <DashboardHeader
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          notificationsRoute="/supervisor/notifications"
        />

        <div style={{ padding: '0 2rem' }}>
          <div className={styles.pageWrapper}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
              <Link to="/" className={styles.breadcrumbLink}>Home</Link>
              <ChevronRight size={14} />
              <span className={styles.breadcrumbCurrent}>Notifications</span>
            </div>

            {/* Page Header */}
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>
                  Updates for {user?.name || 'You'}
                </h1>
                <p className={styles.pageSubtitle}>
                  Everything happening across your assigned papers, reviews, and the repository.
                </p>
              </div>
              <button
                id="mark-all-read-btn"
                className={styles.markAllBtn}
                onClick={handleMarkAllAsRead}
                disabled={marking || unread.length === 0}
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            </div>

            {/* Filter Tabs */}
            <div className={styles.tabBar}>
              <button
                id="tab-unread"
                className={`${styles.tab} ${activeTab === 'unread' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread ({unread.length})
              </button>
              <button
                id="tab-read"
                className={`${styles.tab} ${activeTab === 'read' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('read')}
              >
                Read ({read.length})
              </button>
              <button
                id="tab-all"
                className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({notifications.length})
              </button>
            </div>

            {/* Notification List */}
            {loading ? (
              <div className={styles.loadingState}>Loading notifications…</div>
            ) : displayed.length === 0 ? (
              <div className={styles.notifList}>
                <div className={styles.emptyState}>
                  <p className={styles.emptyStateTitle}>No notifications here</p>
                  <p className={styles.emptyStateDesc}>
                    {activeTab === 'unread'
                      ? "You're all caught up!"
                      : 'Nothing to show in this category.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.notifList}>
                {displayed.map((notif) => (
                  <div
                    key={notif.id}
                    className={styles.notifItem}
                    onClick={() => handleMarkOneRead(notif)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleMarkOneRead(notif); }}
                  >
                    {/* Bell Icon */}
                    <div className={`${styles.notifIconWrapper} ${notif.read ? styles.notifIconWrapperRead : ''}`}>
                      <Bell size={16} />
                    </div>

                    {/* Content */}
                    <div className={styles.notifContent}>
                      <div className={styles.notifItemHeader}>
                        <span className={styles.notifItemTitle}>{notif.title}</span>
                        {!notif.read && (
                          <span className={styles.newBadge}>New</span>
                        )}
                      </div>
                      <p className={styles.notifItemDesc}>{notif.description}</p>
                      <span className={styles.notifItemTime}>
                        {getRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    {/* Action */}
                    <button
                      className={styles.notifItemAction}
                      onClick={(e) => { e.stopPropagation(); handleMarkOneRead(notif); }}
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorNotificationsPage;
