import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  PanelLeft,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import styles from './DashboardHeader.module.css';

/**
 * Shared DashboardHeader used across Student and Supervisor dashboards.
 *
 * Features:
 * - Sidebar toggle button
 * - Search bar (redirects to All Publications page on enter/click when logged in)
 * - Notification bell with badge and dropdown panel
 * - User profile pill with dropdown menu (signed in label, profile, notifications, log out)
 */
const DashboardHeader = ({ onSidebarToggle, notificationsRoute = null }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const finalNotificationsRoute = notificationsRoute || (user?.role === 'repositary admin' ? '/admin/notifications' : user?.role === 'supervisor' ? '/supervisor/notifications' : '/student/notifications');

  // ---- State ----
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ---- Refs for click-outside detection ----
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // ---- Derived values ----
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleLabel = (role) => {
    if (!role) return 'User';
    if (role === 'student') return 'Student';
    if (role === 'supervisor') return 'Supervisor';
    if (role === 'repositary admin') return 'Repositary Admin';
    if (role.includes('admin')) return 'Admin';
    return role;
  };

  // ---- Fetch notifications when user is available ----
  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    try {
      const unread = await notificationService.getUnread(user.email);
      setNotifications(Array.isArray(unread) ? unread.slice(0, 5) : []);
      const countResult = await notificationService.getUnreadCount(user.email);
      setUnreadCount(countResult?.count ?? 0);
    } catch (err) {
      // Fallback to empty state silently
      console.warn('Could not fetch notifications:', err);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ---- Close dropdowns on outside click ----
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- Handlers ----
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!user) return; // Only redirect when logged in
    const route = user?.role === 'supervisor'
      ? '/supervisor/search'
      : '/student/search';
    const dest = searchQuery.trim()
      ? `${route}?q=${encodeURIComponent(searchQuery.trim())}`
      : route;
    navigate(dest);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchSubmit(e);
  };

  const handleSearchFocus = (e) => {
    if (user && user.role !== 'supervisor') {
      navigate('/student/search?focus=true');
    }
  };

  const toggleNotifPanel = () => {
    setNotifOpen((prev) => !prev);
    setProfileOpen(false);
  };

  const toggleProfilePanel = () => {
    setProfileOpen((prev) => !prev);
    setNotifOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const handleNotifClick = (notif) => {
    // Mark as read on click (fire-and-forget)
    if (!notif.read && user?.email) {
      notificationService.markAsRead(notif.id).then(fetchNotifications).catch(() => {});
    }
    setNotifOpen(false);
    navigate(finalNotificationsRoute);
  };

  // ---- Relative time helper ----
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
    <header className={`${styles.topbar} ${user?.role === 'supervisor' ? styles.supervisorTheme : user?.role === 'repositary admin' ? styles.adminTheme : ''}`}>
      {/* Left: sidebar toggle + search */}
      <div className={styles.topbarLeft}>
        <button
          className={styles.sidebarToggleBtn}
          onClick={onSidebarToggle}
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
          id="sidebar-toggle-btn"
        >
          <PanelLeft size={20} />
        </button>

        {user?.role !== 'supervisor' && user?.role !== 'repositary admin' && (
          <form className={styles.searchBox} onSubmit={handleSearchSubmit} role="search">
            <Search className={styles.searchIcon} />
            <input
              type="text"
              id="dashboard-search-input"
              className={styles.searchInput}
              placeholder="Search papers, authors, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search publications"
            />
          </form>
        )}
      </div>

      {/* Right: notification bell + profile pill */}
      <div className={styles.topbarRight}>
        {/* ---- Notification Bell ---- */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            id="notification-bell-btn"
            className={`${styles.notificationBtn} ${notifOpen ? styles.active : ''}`}
            onClick={toggleNotifPanel}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {notifOpen && (
            <div className={styles.notifPanel} id="notification-panel">
              <div className={styles.notifPanelHeader}>
                <span className={styles.notifPanelTitle}>Notifications</span>
                <Link
                  to={finalNotificationsRoute}
                  className={styles.viewAllLink}
                  onClick={() => setNotifOpen(false)}
                  id="view-all-notifications-link"
                >
                  View all
                </Link>
              </div>

              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.notifEmpty}>No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={styles.notifItem}
                      onClick={() => handleNotifClick(notif)}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleNotifClick(notif); }}
                    >
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---- User Profile Pill ---- */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            id="user-profile-pill-btn"
            className={`${styles.userProfilePill} ${profileOpen ? styles.active : ''}`}
            onClick={toggleProfilePanel}
            aria-label="User profile menu"
          >
            <div className={styles.avatarCircle}>
              {getInitials(user?.role === 'repositary admin' ? 'Repositary Admin' : user?.name)}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.role === 'repositary admin' ? 'Repositary Admin' : (user?.name || 'User')}</span>
              <span className={styles.userRole}>{getRoleLabel(user?.role)}</span>
            </div>
            <ChevronDown size={14} style={{ color: '#94a3b8', marginLeft: '2px' }} />
          </button>

          {/* Profile Dropdown Panel */}
          {profileOpen && (
            <div className={styles.profilePanel} id="profile-dropdown-panel">
              <div className={styles.profilePanelHeader}>
                <span className={styles.signedInLabel}>
                  Signed in as {getRoleLabel(user?.role)}
                </span>
                <span className={styles.profilePanelName}>{user?.name || 'User'}</span>
              </div>

              <div className={styles.profilePanelMenu}>
                <Link
                  to={user?.role === 'repositary admin' ? '/admin/profile' : user?.role === 'supervisor' ? '/supervisor/profile' : '/student/profile'}
                  className={styles.profileMenuItem}
                  onClick={() => setProfileOpen(false)}
                  id="profile-menu-profile-link"
                >
                  <User size={16} />
                  Profile
                </Link>

                <Link
                  to={finalNotificationsRoute}
                  className={styles.profileMenuItem}
                  onClick={() => setProfileOpen(false)}
                  id="profile-menu-notifications-link"
                >
                  <Bell size={16} />
                  Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                </Link>

                <span
                  className={styles.profileMenuItemDisabled}
                  title="Coming soon"
                  id="profile-menu-preferences"
                >
                  <Settings size={16} />
                  Preferences
                </span>

                <div className={styles.profileMenuDivider} />

                <button
                  className={styles.profileMenuItemLogout}
                  onClick={handleLogout}
                  id="profile-menu-logout-btn"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
